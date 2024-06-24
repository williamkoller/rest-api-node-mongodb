# Rest API Node MongoDB

Este é um projeto de uma API RESTful desenvolvida em Node.js com MongoDB como banco de dados. A API possui recursos de autenticação, autorização e execução de tarefas em segundo plano.

## Como usar

Siga as etapas abaixo para configurar e executar o projeto em sua máquina local:

1. Clone este repositório em sua máquina:
  ```
  git clone https://github.com/seu-usuario/rest-api-node-mongodb.git
  ```

2. Navegue até o diretório do projeto:
  ```
  cd rest-api-node-mongodb
  ```

3. Instale as dependências do projeto utilizando o Yarn:
  ```
  yarn install --frozen-lockfile
  ```

4. Configure as variáveis de ambiente necessárias para a autenticação e autorização. Consulte a documentação para obter mais informações sobre as variáveis necessárias.

5. Execute o projeto:
  ```
  yarn docker:up --build
  ```

## Autenticação

A API utiliza autenticação baseada em tokens JWT (JSON Web Tokens). Para autenticar, envie uma requisição POST para o endpoint `/auth/login` com as credenciais de usuário. O servidor retornará um token JWT válido que deve ser incluído no cabeçalho `Authorization` de todas as requisições subsequentes.

## Autorização

A autorização é controlada por meio de papéis de usuário. Cada usuário possui um ou mais papéis associados, que determinam as permissões de acesso aos recursos da API. Os papéis são definidos no banco de dados e podem ser gerenciados por um usuário com permissões administrativas.

## Background Jobs

A API suporta a execução de tarefas em segundo plano, como processamento de filas, envio de e-mails, entre outros. Para utilizar essa funcionalidade, basta enviar uma requisição POST para o endpoint `/jobs` com os parâmetros necessários para a tarefa desejada. A tarefa será enfileirada e processada em segundo plano.
