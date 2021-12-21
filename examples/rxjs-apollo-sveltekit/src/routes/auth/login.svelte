<script lang="ts">
  import {ApolloClient} from '@apollo/client/core/index.js';
  import {} from "$"
  let username = '';
  let password = '';



  function handleSubmit(event){
    console.log({
      username,
      password
    })
  }

</script>

<h1>Login page</h1>
<form on:submit|preventDefault={handleSubmit}>
  <input type="text" bind:value={username} name="username"/>
  <input type="password" bind:value={password} name="password"/>
  <button type="submit">Aanmelden</button>
</form>