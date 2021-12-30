<script lang="ts">
  import { useLoginMutation } from '$lib/generated';
  import { tokens$ } from '$lib/auth/tokens';
  import { goto } from '$app/navigation';

  let username = 'dennie';
  let password = '9HYyEhGG0BQ!ZWEP30&Qdx%n';

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
    const { data, loading, called } = $loginResult;
    if (called && !loading && data?.login) {
      tokens$.next(data.login);
      const redirectTo = history.state?.redirectTo ?? '/';
      goto(redirectTo);
    }
  }
</script>

<h1>Login page</h1>
<form on:submit|preventDefault={handleSubmit}>
  <label for="username">Username:</label><br />
  <input type="text" bind:value={username} name="username" /><br />
  <label for="password">Password:</label><br />
  <input type="password" bind:value={password} name="password" /><br />
  <input
    type="submit"
    disabled={username.length === 0 || password.length === 0 || $loginResult.loading}
    value="Aanmelden"
  />
</form>
