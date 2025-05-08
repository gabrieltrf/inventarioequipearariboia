# Configuração do Firebase para o Sistema de Inventário

## Passo 1: Configurar Regras de Segurança no Firestore

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto "arariinventario"
3. No menu lateral, clique em "Firestore Database"
4. Clique na aba "Regras"
5. Substitua as regras existentes pelo conteúdo abaixo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permissões temporárias para desenvolvimento
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Clique em "Publicar"

> **IMPORTANTE**: As regras acima permitem acesso total ao banco de dados sem autenticação. Isso é apropriado apenas para ambiente de desenvolvimento. Para um ambiente de produção, você deve implementar regras mais restritivas baseadas em autenticação.

## Passo 2: Corrigir a Configuração do Storage

1. No console do Firebase, vá para "Storage"
2. Verifique se o bucket está configurado corretamente
3. O endereço do bucket deve ser `arariinventario.appspot.com` (não `arariinventario.firebasestorage.app`)

   **Por que usar `.appspot.com` em vez de `.firebasestorage.app`?**
   
   - O formato padrão para buckets do Firebase Storage é `[PROJECT_ID].appspot.com`
   - Este é o nome oficial do bucket gerado automaticamente pelo Firebase
   - O domínio `firebasestorage.app` não é um formato padrão para buckets do Firebase
   - Usar o formato incorreto causará erros de conexão e permissão
   - Para verificar o nome correto do seu bucket:
     1. No console do Firebase, vá para "Storage"
     2. Clique em "Configurações"
     3. O bucket correto aparecerá em "Nome do bucket do Cloud Storage"

## Passo 3: Inicializar as Coleções Automaticamente

Você pode inicializar todas as coleções necessárias automaticamente com o script de configuração:

1. Instale as dependências necessárias (caso ainda não tenha feito):
   ```
   npm install ts-node tsconfig-paths --save-dev
   ```

2. Execute o script de configuração:
   ```
   npm run setup:firebase
   ```

O script criará automaticamente as seguintes coleções:
- `categories` - Categorias de itens
- `locations` - Localizações de armazenamento
- `items` - Itens do inventário
- `movements` - Registro de movimentações
- `loans` - Registro de empréstimos

## Passo 4: Estrutura de Dados Recomendada

### Documento de Categoria (categories):
```
{
  name: string
}
```

### Documento de Localização (locations):
```
{
  name: string,
  description: string,
  capacity: number (opcional),
  responsible: string (opcional),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Documento de Item (items):
```
{
  name: string,
  description: string,
  category: {
    id: string,
    name: string
  },
  quantity: number,
  minQuantity: number,
  unit: string,
  locationId: string,
  status: string,
  imageUrl: string (opcional),
  documents: array (opcional),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Problemas Comuns

1. **Erro "Missing or insufficient permissions"**
   - Verifique se as regras de segurança foram configuradas corretamente
   - Confirme que você publicou as regras após alterá-las

2. **Erro ao adicionar campos undefined**
   - O Firestore não aceita valores `undefined`
   - Certifique-se de que todos os campos opcionais sejam excluídos ou transformados para `null`

3. **Erro 404 para localizações**
   - Este erro pode ocorrer se o roteamento da aplicação não estiver configurado corretamente
   - Verifique se as rotas em `App.tsx` estão corretas e se o servidor de desenvolvimento está rodando

4. **Problemas com o script de inicialização**
   - Se o script falhar com erros de resolução de módulos, tente usar o comando completo:
     ```
     npx ts-node -r tsconfig-paths/register src/scripts/firebaseSetup.ts
     ```
   - Certifique-se de que suas credenciais do Firebase estão configuradas corretamente em `firebase.ts`
