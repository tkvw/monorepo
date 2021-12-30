<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { setViewer } from '$lib/auth/viewer';
  import { tokens$ } from '$lib/auth/tokens';
  import { useAllSettingsQuery, useViewerQuery } from '$lib/generated';
  import { catchError, distinctUntilKeyChanged, filter, map, NEVER, of, pipe, retry, tap } from 'rxjs';

  const viewerResponse$ = useViewerQuery(
    tokens$.pipe(
      distinctUntilKeyChanged('refreshToken'),
      map((x) => ({ skip: !x.refreshToken }))
    )
  );

  const settings$ = useAllSettingsQuery(of({}));

  $: console.log("*****************",$settings$);

  function refetchSettings() {
    settings$.refetch();
  }

  // const viewer$ = viewerResponse$.pipe(map((x) => x.data?.viewer ?? undefined));
  // const authorized$ = viewerResponse$.pipe(
  //   filter((x) => !x.loading),
  //   tap((x) => setViewer(x.data?.viewer)),
  //   map((x) => !!x.data?.viewer)
  // );
  $: console.log('$viewerResponse$', $viewerResponse$);
  $: if (!$viewerResponse$.loading) {
    // if (!$viewer$) {
    //   const redirectTo = $page.path;
    //   if (redirectTo !== '/auth/login') {
    //     goto('/auth/login', {
    //       state: {
    //         redirectTo
    //       }
    //     });
    //   }
    // }
  }
  function handleLogoff() {
    tokens$.next({});
  }
</script>

{#if $viewerResponse$.loading}
  Loading...
{:else}
  <slot />
  <button on:click={handleLogoff}>Logoff</button>
{/if}

<button on:click={refetchSettings} disabled={$settings$.loading}>Refresh settings</button>
