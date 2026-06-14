// Configuracao fixa do backend Lumenn Relay. A anon key e publica por design;
// o acesso real e limitado pelas policies RLS usando X-Lumenn-World-Token.
const LUMENN_SUPABASE_URL = "https://buqhdfdqeqrhsibrwbsa.supabase.co";
const LUMENN_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cWhkZmRxZXFyaHNpYnJ3YnNhIiwi" +
  "cm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODEzODAsImV4cCI6MjA5Njk1NzM4MH0.qHnw0XZe58Uw4MmaEH_axXwx5PE4rlof3QalzAQu6Q4";

export class RelayQueue {
  constructor(worldToken) {
    this.supabaseUrl = LUMENN_SUPABASE_URL.replace(/\/$/, "");
    this.supabaseAnonKey = LUMENN_SUPABASE_ANON_KEY;
    this.worldToken = worldToken;
    this.queue = [];
    this.processing = false;
    this.maxRetries = 5;
  }

  enqueue(payload) {
    this.queue.push({ payload, retries: 0 });
    if (!this.processing) this.processQueue();
  }

  async processQueue() {
    this.processing = true;
    while (this.queue.length > 0) {
      const item = this.queue[0];
      const success = await this.send(item.payload);
      if (success) {
        this.queue.shift();
      } else {
        item.retries++;
        if (item.retries >= this.maxRetries) {
          console.error("Lumenn Roll Relay | Descartando rolagem após 5 tentativas:", item.payload.formula);
          this.queue.shift();
        } else {
          const delay = Math.min(2 ** (item.retries - 1) * 1000, 30000);
          console.warn(`Lumenn Roll Relay | Retry ${item.retries}/${this.maxRetries} em ${delay / 1000}s`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    this.processing = false;
  }

  async send(payload) {
    try {
      const headers = {
        "apikey": this.supabaseAnonKey,
        "Authorization": `Bearer ${this.supabaseAnonKey}`,
        "X-Lumenn-World-Token": this.worldToken,
      };

      const worldRes = await fetch(
        `${this.supabaseUrl}/rest/v1/worlds?world_token=eq.${encodeURIComponent(this.worldToken)}&select=id`,
        { headers },
      );
      if (!worldRes.ok) {
        console.error("Lumenn Roll Relay | Erro ao buscar world:", worldRes.status, await worldRes.text());
        return false;
      }

      const worlds = await worldRes.json();
      if (!worlds?.length) {
        console.error("Lumenn Roll Relay | World token inválido ou não encontrado.");
        return false;
      }
      const worldId = worlds[0].id;

      const playerQuery = new URLSearchParams({
        world_id: `eq.${worldId}`,
        foundry_user_id: `eq.${payload.foundry_user_id}`,
        select: "id",
      });
      const playerRes = await fetch(`${this.supabaseUrl}/rest/v1/players?${playerQuery.toString()}`, {
        headers,
      });
      if (!playerRes.ok) {
        console.error("Lumenn Roll Relay | Erro ao buscar player:", playerRes.status, await playerRes.text());
        return false;
      }

      const players = await playerRes.json();
      let playerId = players?.[0]?.id;

      if (!playerId) {
        const createPlayerQuery = new URLSearchParams({ select: "id" });
        const createRes = await fetch(`${this.supabaseUrl}/rest/v1/players?${createPlayerQuery.toString()}`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
          },
          body: JSON.stringify({
            world_id: worldId,
            foundry_user_id: payload.foundry_user_id,
            display_name: payload.display_name,
          }),
        });

        if (!createRes.ok) {
          console.error("Lumenn Roll Relay | Falha ao criar player:", createRes.status, await createRes.text());
          return false;
        }

        const created = await createRes.json();
        playerId = created?.[0]?.id;
        if (!playerId) {
          console.error("Lumenn Roll Relay | Falha ao criar player.");
          return false;
        }
      }

      const rollRes = await fetch(`${this.supabaseUrl}/rest/v1/rolls`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          world_id: worldId,
          player_id: playerId,
          formula: payload.formula,
          result: payload.result,
          is_critical: payload.is_critical,
          is_fumble: payload.is_fumble,
          roll_type: payload.roll_type,
          system_data: payload.system_data || null,
        }),
      });

      if (rollRes.ok || rollRes.status === 201) {
        console.log(
          `Lumenn Roll Relay | Rolagem enviada: ${payload.formula} = ${payload.result}${
            payload.is_critical ? " CRITICO" : ""
          }${payload.is_fumble ? " FALHA" : ""}`,
        );
        return true;
      }

      console.error("Lumenn Roll Relay | Erro ao inserir roll:", rollRes.status, await rollRes.text());
      return false;
    } catch (error) {
      console.error("Lumenn Roll Relay | Erro de rede:", error.message);
      return false;
    }
  }
}
