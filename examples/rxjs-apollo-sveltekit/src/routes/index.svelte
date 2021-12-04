<script lang="ts">
  import { useLaunchesPastQuery } from '../generated';
  import { of } from 'rxjs';

  const launchesPast = useLaunchesPastQuery(
    of({
      useInitialLoading: true
    })
  );

  $: {
    console.log($launchesPast);
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if $launchesPast.loading}
  Loading...
{:else}
  <ul>
    {#each $launchesPast.data.launchesPast as launch}
      <li>{launch.mission_name}</li>
    {/each}
  </ul>
{/if}
