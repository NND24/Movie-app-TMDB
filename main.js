const API_KEY = "api_key=7a89d6a434efbbc0e0ad8bb22a33826a";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const SEARCH_URL = BASE_URL + "/search/movie?" + API_KEY;
const GENRE_URL = BASE_URL + "/genre/movie/list?" + API_KEY;

const form = document.querySelector(".form");
const search = document.querySelector(".search");
const main = document.querySelector(".main");
const tags = document.querySelector(".tags");
var next = document.querySelector(".next");
var prev = document.querySelector(".prev");

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var totalPage = 100;
var lastUrl = "";

getGenres(GENRE_URL);

function getGenres(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      showGenre(data.genres);
    });
}

var selectedGenre = [];
function showGenre(data) {
  tags.innerHTML = ``;
  data.forEach((genre) => {
    const { id, name } = genre;
    const genreEl = document.createElement("div");
    genreEl.classList.add("tag");
    genreEl.id = id;
    genreEl.innerText = name;
    tags.appendChild(genreEl);
    genreEl.addEventListener("click", () => {
      if (selectedGenre.length === 0) {
        selectedGenre.push(genre.id);
      } else {
        if (selectedGenre.includes(genre.id)) {
          selectedGenre = selectedGenre.filter((item) => item !== genre.id);
        } else {
          selectedGenre.push(genre.id);
        }
      }
      getMovies(API_URL + "&with_genres=" + encodeURI(selectedGenre.join(",")));
      highlightSelection();
    });
  });
}

function highlightSelection() {
  const tags = document.querySelectorAll(".tag");
  tags.forEach((tag) => {
    tag.classList.remove("selected");
  });

  if (selectedGenre.length !== 0) {
    selectedGenre.map((id) => {
      document.getElementById(id).classList.add("selected");
    });
  }
}

getMovies(API_URL);

function getMovies(url) {
  url = url;
  lastUrl = url;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.results.length > 0) {
        showMovies(data.results);
        currentPage = data.page;
        nextPage = currentPage + 1;
        prevPage = currentPage - 1;
        totalPage = data.total_pages;
      } else {
        main.innerHTML = `<h1>NOT FOUND</h1>`;
      }
    });
}

function showMovies(data) {
  main.innerHTML = ``;

  data.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;
    let color;
    if (vote_average >= 8) {
      color = "green";
    } else if (vote_average >= 4 && vote_average < 8) {
      color = "orange";
    } else {
      color = "red";
    }

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.innerHTML = `
        <img src="${IMG_URL}${poster_path}" alt="${title}" />
        <div class="movie-info">
          <h3 class="movie-name">${title}</h3>
          <span class="movie-rating ${color}">${vote_average}</span>
        </div>
        <div class="overview">
          <h4 class="overview-title">Overview</h4>
          <p>${overview}</p>
          <br/>
          <button class="know-more" id="${id}">Know more</button>
        </div>
      `;

    main.appendChild(movieEl);

    document.getElementById(id).addEventListener("click", () => {
      openPopup(movie);
    });
  });
}

const movieContainer = document.querySelector(".movie-container");
const moviePopup = document.getElementsByClassName("movie-popup");
function openPopup(movie) {
  let id = movie.id;
  fetch(BASE_URL + "/movie/" + id + "/videos?" + API_KEY)
    .then((res) => res.json())
    .then((videoData) => {
      if (videoData) {
        moviePopup[0].style.display = "flex";
        if (videoData.results.length > 0) {
          var embed = [];
          videoData.results.forEach((video) => {
            let { name, key, site } = video;
            embed.push(`
                <iframe width="560" height="480" class="embed hide" src="https://www.youtube.com/embed/${key}" title="${name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                `);
          });
          movieContainer.innerHTML = embed.join("");
          activeSlide = 0;
          showVideo();
        } else {
          movieContainer.innerHTML = `<div>No Found</div>`;
        }
      }
    });
}

var activeSlide = 0;
function showVideo() {
  let embedClasses = document.querySelectorAll(".embed");
  embedClasses.forEach((embedTag, idx) => {
    if (activeSlide == idx) {
      embedTag.classList.add("show");
      embedTag.classList.remove("hide");
    } else {
      embedTag.classList.add("hide");
      embedTag.classList.remove("show");
    }
  });
}

document.querySelector(".close").addEventListener("click", () => {
  moviePopup[0].style.display = "none";
});

function clearBtn() {
  let clearBtn = document.querySelector(".clear");
  if (clearBtn) {
    clearBtn.classList.add("selected");
  } else {
    let clear = document.createElement("div");
    clear.classList.add("tag", "selected", "clear");
    clear.innerText = "Clear X";
    clear.addEventListener("click", () => {
      selectedGenre = [];
      getMovies(API_URL);
    });
    tags.appendChild(clear);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let searchTerm = search.value;
  selectedGenre = [];
  highlightSelection();
  if (searchTerm) {
    getMovies(SEARCH_URL + "&query=" + searchTerm);
  } else {
    getMovies(API_URL);
  }
});

next.addEventListener("click", () => {
  if (prevPage <= totalPage) {
    pageCall(nextPage);
    genderPagination();
  }
});

prev.addEventListener("click", () => {
  if (prevPage > 0) {
    pageCall(prevPage);
    genderPagination();
  }
});

function pageCall(page) {
  let urlSplit = lastUrl.split("?");
  let queryParams = urlSplit[1].split("&");
  let key = queryParams[queryParams.length - 1].split("=");
  if (key[0] != "page") {
    let url = lastUrl + "&page=" + page;
    getMovies(url);
  } else {
    key[1] = page.toString();
    let a = key.join("=");
    queryParams[queryParams.length - 1] = a;
    let b = queryParams.join("&");
    let url = urlSplit[0] + "?" + b;
    getMovies(url);
  }
}
