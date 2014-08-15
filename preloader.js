var loaded = [],
	xhr = null, // XMLHttpRequest
	isLoading = false,
    tempImg = new Image();

function preloader(stopLoading) {
    // abort request if it's working
    if (xhr) {
        xhr.abort();
        xhr = null;
    }

    // remove loader
    if (stopLoading == false || isLoading) {
        // remove loading el
    }

    // preload
    if (loaded.indexOf(toLoad) <= -1) {
        isLoading = true;

        /*
         *  HOLD FUNCTIONS TO SYNC CALLINGS HERE
         */

        /*
         * loader interaction
         * if (!elLoading.length)
         */

         /*
         * callbacks
         * add itens to item loaded
         * preload false, ready to the next one
         */
    }
}