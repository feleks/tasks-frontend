
export function addScrollToBottomListener(listDiv: HTMLDivElement) {
    // let isLoading = false;
    // async function scrollListener(event: Event) {
    //     if (listDiv.offsetHeight + listDiv.scrollTop + 5 >= listDiv.scrollHeight) {
    //         if (isLoading) {
    //             return;
    //         }
    //         const bookmark = listDiv.dataset['bookmark'];
    //         if (bookmark == null) {
    //             return;
    //         }
    //         try {
    //             isLoading = true;
    //             const newBookmark = await getProjects(false, bookmark);
    //             if (listDiv != null) {
    //                 listDiv.dataset['bookmark'] = newBookmark;
    //             }
    //         } catch (e) {
    //             useNotificationStore.getState().show('error', 'Failed to load more projects');
    //         } finally {
    //             isLoading = false;
    //         }
    //     }
    // }
    // listDiv.addEventListener('scroll', scrollListener);
    // return () => {
    //     listDiv.removeEventListener('scroll', scrollListener);
    // };
}
