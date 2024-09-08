import { defineStore } from "pinia";

export const usePlayersStore = defineStore("players", {
  state: () => ({
    players: [],
    searchQuery: "",
    selectedRoles: [],
    showBought: false,
    showFavourite: false,
    showTaken: false,
    showAvailable: false,
    activePlayerId: null,
    orderBy: "fvm_mantra",
    budget: 500,
    fetchPlayersDataTimeout: null,
    showLoader: false,
    selectedTeam: "",
    meanFmForRole: {
      pc: "6.52",
      a: "5.87",
      w: "5.87",
      e: "5.71",
      b: "5.67",
      dd: "5.65",
      c: "5.62",
      m: "5.58",
      t: "5.56",
      ds: "5.51",
      dc: "5.43",
      por: "4.82",
    },
    teams: [
      "ATA",
      "BOL",
      "CAG",
      "COM",
      "EMP",
      "FIO",
      "GEN",
      "INT",
      "JUV",
      "LAZ",
      "LEC",
      "MIL",
      "MON",
      "NAP",
      "PAR",
      "ROM",
      "TOR",
      "UDI",
      "VEN",
      "VER",
    ],
  }),
  getters: {
    filteredPlayers: (state) => {
      const query = state.searchQuery.toLowerCase();
      return state.players
        .filter((player) => {
          const nameMatch = player.name.toLowerCase().includes(query);
          const roleMatch =
            state.selectedRoles.length === 0 ||
            player.role_mantra
              .split("|")
              .some((role) => state.selectedRoles.includes(role.trim()));
          const statusMatch =
            (!state.showBought &&
              !state.showFavourite &&
              !state.showTaken &&
              !state.showAvailable) ||
            (state.showBought && player.bought) ||
            (state.showFavourite &&
              player.favourite &&
              !player.bought &&
              !player.taken) ||
            (state.showTaken && player.taken && !player.bought) ||
            (state.showAvailable && !player.bought && !player.taken);
          const teamMatch = state.selectedTeam
            ? player.team === state.selectedTeam
            : true;
          return nameMatch && roleMatch && statusMatch && teamMatch;
        })
        .sort((a, b) => {
          if (state.orderBy === "fvm_mantra") {
            return b.fvm_mantra - a.fvm_mantra;
          } else if (state.orderBy === "titolarita") {
            return b.titolarita - a.titolarita;
          } else if (state.orderBy === "trend") {
            const trendA =
              ((a.current_price_mantra - a.initial_price_mantra) /
                a.initial_price_mantra) *
              100;
            const trendB =
              ((b.current_price_mantra - b.initial_price_mantra) /
                b.initial_price_mantra) *
              100;
            return trendB - trendA;
          } else if (state.orderBy === "my_valuation") {
            return b.my_valuation - a.my_valuation;
          } else if (state.orderBy === "buy_threshold") {
            return b.buy_threshold - a.buy_threshold;
          } else if (state.orderBy === "fantamedia") {
            return b.fm - a.fm;
          } else if (state.orderBy === "algo_ai") {
            return b.algoAi - a.algoAi;
          }
          return 0;
        });
    },
    boughtPlayers: (state) => {
      const roleOrder = [
        "pc",
        "a",
        "t",
        "w",
        "c",
        "m",
        "e",
        "ds",
        "dd",
        "b",
        "dc",
        "por",
      ];
      return state.players
        .filter((player) => player.bought)
        .sort((a, b) => {
          const aRoles = a.role_mantra.split("|").map((role) => role.trim());
          const bRoles = b.role_mantra.split("|").map((role) => role.trim());
          const aIndex = Math.min(
            ...aRoles.map((role) => roleOrder.indexOf(role)),
          );
          const bIndex = Math.min(
            ...bRoles.map((role) => roleOrder.indexOf(role)),
          );
          return aIndex - bIndex;
        });
    },
    remainingCredits: (state) => {
      const spentCredits = state.players.reduce(
        (total, player) => total + (player.bought ? player.amount_paid : 0),
        0,
      );
      return state.budget - spentCredits;
    },
  },
  actions: {
    algoAi(player) {
      let value = 0;
      let top = ["INT", "JUV", "LAZ", "ATA"];
      let midtop = ["NAP", "ROM", "MIL", "PAR", "VER", "BOL"];
      let midbottom = ["TOR", "FIO", "UDI", "CAG", "EMP"];
      let bottom = ["GEN", "LEC", "COM", "VEN", "MON"];

      if (top.includes(player.team)) {
        value += 10;
      }

      if (midtop.includes(player.team)) {
        value += 5;
      }

      if (midbottom.includes(player.team)) {
        value -= 5;
      }

      if (bottom.includes(player.team)) {
        value -= 10;
      }

      value += player.fm * (player.partite_a_voto / 1.5);
      if (player.titolarita > 0.7) {
        value += 7;
      } else if (player.titolarita > 0.5) {
        value += 3;
      }

      const trend = Math.round(
        ((player.current_price_mantra - player.initial_price_mantra) /
          player.initial_price_mantra) *
          100,
      );

      if (trend > 50) {
        value += 10;
      } else if (trend > 25) {
        value += 5;
      } else if (trend > 10) {
        value += 3;
      } else if (trend < -20) {
        value -= 10;
      } else if (trend < -10) {
        value -= 5;
      } else if (trend < -5) {
        value -= 3;
      } else if (trend < -2) {
        value -= 2;
      }

      if (player.penalty) {
        value += 3;
      }

      if (player.penalty_kick) {
        value += 1;
      }

      value += player.role_mantra.length * 2;

      return Math.floor(value);
    },
    setPlayers(players) {
      this.players = players.map((player) => ({
        ...player,
        algoAi: this.algoAi(player),
      }));
    },
    getPlayerById(playerId) {
      return this.players.find((item) => item.id === playerId);
    },
    setSearchQuery() {
      const query = this.searchQuery;
      if (query.startsWith("/")) {
        const role = query.slice(1).toLowerCase();
        console.log(role);
        if (Object.keys(this.meanFmForRole).includes(role)) {
          this.toggleRole(role);
          this.searchQuery = "";
        } else {
          this.searchQuery = query;
        }
      } else {
        this.searchQuery = query;
      }
    },
    toggleRole(role) {
      this.selectedRoles = [role];
    },
    setSelectedTeam(team) {
      console.log(team);
      this.selectedTeam = team;
    },
    toggleBoughtFilter() {
      this.showBought = !this.showBought;
      if (this.showBought) {
        this.showFavourite = false;
        this.showTaken = false;
        this.showAvailable = false;
        this.selectedRoles = [];
      }
    },
    toggleFavouriteFilter() {
      this.showFavourite = !this.showFavourite;
      if (this.showFavourite) {
        this.showBought = false;
        this.showTaken = false;
        this.showAvailable = false;
        this.selectedRoles = [];
      }
    },
    toggleTakenFilter() {
      this.showTaken = !this.showTaken;
      if (this.showTaken) {
        this.showBought = false;
        this.showFavourite = false;
        this.showAvailable = false;
        this.selectedRoles = [];
      }
    },
    toggleAvailableFilter() {
      this.showAvailable = !this.showAvailable;
      if (this.showAvailable) {
        this.showBought = false;
        this.showFavourite = false;
        this.showTaken = false;
      }
    },
    resetPlayerStatusFilters() {
      this.showTaken = false;
      this.showBought = false;
      this.showFavourite = false;
      this.showAvailable = false;
    },
    async fetchPlayersData() {
      this.showLoader = true;
      if (this.fetchPlayersDataTimeout) {
        clearTimeout(this.fetchPlayersDataTimeout);
      }
      this.fetchPlayersDataTimeout = setTimeout(async () => {
        try {
          const response = await fetch("/api/database");
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          this.setPlayers(await response.json());
          this.showLoader = false;
        } catch (error) {
          console.error("Failed to fetch players:", error);
        }
      }, 500);
    },
    setActivePlayerId(id) {
      this.activePlayerId = id;
    },
    setOrderBy(value) {
      if (
        [
          "fvm_mantra",
          "titolarita",
          "trend",
          "my_valuation",
          "buy_threshold",
          "fantamedia",
        ].includes(value)
      ) {
        this.orderBy = value;
      }
    },
    async toggleFavourite(playerId) {
      try {
        const player = this.players.find((p) => p.id === playerId);
        if (!player) return;

        const response = await fetch("/api/set-favourite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: playerId,
            isFavourite: !player.favourite,
          }),
        });
        if (response.ok) {
          player.favourite = !player.favourite;
          this.fetchPlayersData();
        } else {
          console.error("Failed to update favourite status");
        }
      } catch (error) {
        console.error("Error toggling favourite:", error);
      }
    },

    async toggleTaken(playerId) {
      try {
        const player = this.players.find((p) => p.id === playerId);
        if (!player) return;

        const response = await fetch("/api/set-taken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: playerId,
            isTaken: !player.taken,
          }),
        });
        if (response.ok) {
          player.taken = !player.taken;
          this.fetchPlayersData();
        } else {
          console.error("Failed to update taken status");
        }
      } catch (error) {
        console.error("Error toggling taken:", error);
      }
    },

    async toggleBought(playerId) {
      try {
        const player = this.players.find((p) => p.id === playerId);
        if (!player) return;

        const response = await fetch("/api/set-bought", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: playerId,
            isBought: !player.bought,
          }),
        });
        if (response.ok) {
          player.bought = !player.bought;
          this.fetchPlayersData();
        } else {
          console.error("Failed to update bought status");
        }
      } catch (error) {
        console.error("Error toggling bought:", error);
      }
    },

    async setValuation(playerId, value) {
      try {
        const player = this.players.find((p) => p.id === playerId);
        if (!player) return;

        const newValue = value === player.my_valuation ? 0 : value;
        const response = await fetch("/api/set-valuation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: playerId,
            valuation: newValue,
          }),
        });
        if (response.ok) {
          console.log("Valuation set successfully");
          this.fetchPlayersData();
        } else {
          console.error("Failed to set valuation");
        }
      } catch (error) {
        console.error("Error setting valuation:", error);
      }
    },
    async setAmountPaid(playerId, value) {
      try {
        const player = this.players.find((p) => p.id === playerId);
        if (!player) return;

        const response = await fetch("/api/set-amount-paid", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: playerId,
            amountPaid: parseInt(value),
          }),
        });
        if (response.ok) {
          console.log("Amount paid set successfully");
          this.fetchPlayersData();
        } else {
          console.error("Failed to set amount paid");
        }
      } catch (error) {
        console.error("Error setting amount paid:", error);
      }
    },
    async setBuyThreshold(playerId, value) {
      try {
        const player = this.players.find((p) => p.id === playerId);
        if (!player) return;
        if (!value) value = 0;

        const response = await fetch("/api/set-buy-threshold", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: playerId,
            buyThreshold: parseInt(value),
          }),
        });
        if (response.ok) {
          console.log("Buy threshold set successfully");
          this.fetchPlayersData();
        } else {
          console.error("Failed to set buy threshold");
        }
      } catch (error) {
        console.error("Error setting buy threshold:", error);
      }
    },
  },
});
