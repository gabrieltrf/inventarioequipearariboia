import { initializeFirestore } from "./initializeFirestore";

/**
 * Esta função é o ponto de entrada para configurar o Firebase.
 * 
 * Para executar este script:
 * 1. Certifique-se de ter configurado corretamente o arquivo firebase.ts
 * 2. No terminal, execute:
 *    npx ts-node -r tsconfig-paths/register src/scripts/firebaseSetup.ts
 */
async function setupFirebase() {
  try {
    console.log("🚀 Iniciando configuração do Firebase...");
    
    // Inicializar as coleções do Firestore
    await initializeFirestore();
    
    console.log("🎉 Configuração concluída!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante a configuração:", error);
    process.exit(1);
  }
}

// Executar a função imediatamente
setupFirebase();
