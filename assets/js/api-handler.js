// Configurazione API
const API_BASE_URL = "https://www.zerobullsh.it/LifeInsure/proxy.php"; // URL di test dell'API
const API_KEY = "yra9qc9WffYaEsKlib8IrQwc2GRLdUCEJIzOo4uTfyc"; // API key ufficiale dalla documentazione

// Funzione di test di connessione all'API
async function testConnectionToAPI() {
  try {
    console.log("Tentativo di test connessione API...");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("API_KEY esiste:", !!API_KEY);

    // Usa una richiesta GET di base per testare la connettività
    const testResponse = await fetch(
      `${API_BASE_URL}/squarelife_protection/api/v0/switzerland/life_insurance/premium`,
      {
        method: "OPTIONS",
        headers: {
          "X-SQUARELIFE-APIKEY": API_KEY,
        },
      }
    );
    console.log("Test di connessione riuscito:", testResponse.status);
    return true;
  } catch (error) {
    console.error("Test di connessione fallito:", error);
    return false;
  }
}

// Funzione principale di calcolo premio
async function calcolaPremio(dati) {
  console.log("Funzione calcolaPremio chiamata con dati:", dati);

  try {
    // Esegui test di connessione prima di procedere
    await testConnectionToAPI();

    // Formatta data di nascita nel formato richiesto dall'API (YYYYMMDD)
    const dataNascita = new Date(dati.dataNascita);
    const birthdate = parseInt(
      dataNascita.getFullYear().toString() +
        (dataNascita.getMonth() + 1).toString().padStart(2, "0") +
        dataNascita.getDate().toString().padStart(2, "0")
    );

    // Data attuale per origin (formato YYYYMMDD)
    const oggi = new Date();
    const origin = parseInt(
      oggi.getFullYear().toString() +
        (oggi.getMonth() + 1).toString().padStart(2, "0") +
        oggi.getDate().toString().padStart(2, "0")
    );

    // Costruisci l'oggetto dati per l'API secondo la documentazione
    const datiAPI = {
      origin: origin,
      birthdate: birthdate,
      smoker: dati.fumatore,
      duration: parseInt(dati.durata),
      coverage: parseInt(dati.copertura),
    };

    // Aggiungi altezza e peso se forniti
    if (dati.altezza) {
      datiAPI.height = parseInt(dati.altezza);
    }

    if (dati.peso) {
      datiAPI.weight = parseInt(dati.peso);
    }

    console.log("Dati formattati per l'API:", datiAPI);
    console.log(
      "URL completo:",
      `${API_BASE_URL}/squarelife_protection/api/v0/switzerland/life_insurance/premium`
    );

    // Effettua la chiamata API con gestione errori migliorata
    console.log("Tentativo di chiamata fetch...");
    const risposta = await fetch(
      `${API_BASE_URL}/squarelife_protection/api/v0/switzerland/life_insurance/premium`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SQUARELIFE-APIKEY": API_KEY,
        },
        body: JSON.stringify(datiAPI),
      }
    );

    console.log("Risposta ricevuta con status:", risposta.status);

    // Verifica lo stato della risposta
    if (!risposta.ok) {
      const erroreRisposta = await risposta.text();
      console.error("Errore API:", risposta.status, erroreRisposta);
      return {
        errore: `Errore dal server API (${risposta.status}): ${erroreRisposta}`,
      };
    }

    // Gestisci la risposta
    const datiRisposta = await risposta.json();
    console.log("Dati risposta API:", datiRisposta);

    return datiRisposta;
  } catch (errore) {
    console.error("Errore nel calcolo del premio:", errore);
    return {
      errore: `Si è verificato un errore durante la chiamata all'API: ${errore.message}`,
    };
  }
}

// Esegui il test di connessione all'avvio per verificare la configurazione
document.addEventListener("DOMContentLoaded", function () {
  console.log("API handler caricato. Esecuzione test connessione...");
  testConnectionToAPI();
});
