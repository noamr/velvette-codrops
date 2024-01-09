async function init() {
    const {
        results
    } = await (await fetch("./data.json")).json();
    /** @type {Map<number, {title: string, id: number, poster_path: string}} */
    function render() {
        const {
            searchParams
        } = new URL(location.href);
        const sort_by = document.forms.sorter.elements.sort.value;
        const movies = new Map(results.map(movie => [movie.id, movie]));
        const list = document.querySelector("section#list ul");
        list.innerHTML = "";

        function value(movie, prop) {
            if (prop === "release_date")
                return new Date(movie.release_date).valueOf();
            else
                return movie[prop]
        }

        for (const movie of Array.from(movies.values()).sort((a, b) => value(a, sort_by) - value(b, sort_by))) {
            const li = /** @type {HTMLTemplateElement} */ (document.querySelector("template#movie-item")).content.firstElementChild.cloneNode(true);
            li.querySelector("span").innerText = movie.title;
            li.querySelector("img").src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
            li.querySelector("a").href = `?movie=${movie.id}`;
            li.id = `movie-${movie.id}`;
            list.append(li);
        }

        if (searchParams.has("movie")) {
            const movie = movies.get(+searchParams.get("movie"));
            const details = document.querySelector("#details");
            details.querySelector(".title").innerText = movie.title;
            details.querySelector("img").src = `https://image.tmdb.org/t/p/w400${movie.poster_path}`;
        }

        document.documentElement.classList.toggle("details", searchParams.has("movie"));
    }

    document.forms.sorter.addEventListener("change", () => {
        Velvette.startViewTransition({
            update: () => render(),
            captures: {
                "section#list li[:id]": "$(id)"
            }
        });
    });

    const velvette = new Velvette({
        routes: {
            details: "?movie=:movie_id",
            list: "?list"
        },
        rules: [{
            with: ["list", "details"], class: "expand"
        }, ],
        captures: {
            ":root.vt-expand.vt-route-details img#hero": "movie-artwork",
            ":root.vt-expand.vt-route-list li#movie-$(movie_id) img": "movie-artwork"
        }
    });

    window.navigation.addEventListener("navigate", e => {
        velvette.intercept(e, {
            handler() {
                render();
            }
        });
    });
    render();

}

init();