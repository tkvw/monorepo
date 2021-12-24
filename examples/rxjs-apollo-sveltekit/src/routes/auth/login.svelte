<script lang="ts">
  import { useLoginMutation } from '$lib/generated';

  let username = '';
  let password = '';

  const [login, loginResult] = useLoginMutation();

  function handleSubmit(event) {
    login.next({
      variables: {
        input: {
          username,
          password
        }
      }
    });
  }

  $: {
    console.log($loginResult);
  }
</script>

<h1>Login page</h1>
<form on:submit|preventDefault={handleSubmit}>
  <input type="text" bind:value={username} name="username" />
  <input type="password" bind:value={password} name="password" />
  <button type="submit">Aanmelden</button>
</form>
