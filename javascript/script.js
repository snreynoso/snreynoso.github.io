var myApp = myApp || {};

const numGifSearch = 24;
const numGifTrending = 12;
const numGifSuggest = 4;
const GIPHY_KEY = '2256WmPycPBqyzJaDx6Gzx0IoZspB7Ml';
const key = '?api_key=2256WmPycPBqyzJaDx6Gzx0IoZspB7Ml';

let urlUpload = `https://upload.giphy.com/v1/gifs?api_key=${GIPHY_KEY}`;
let urlGetById = 'https://api.giphy.com/v1/gifs/';

let myGifId;
let myGifUrl;

let initTrendingCard = 0;

let gifsSearchArray = [];
let gifsTrendingArray = [];
let favoritesIdArray = [];
let gifsFavoriteArray = [];
let myGifArray = [];
let myGifArrayFromLS = [];

class gifObj { };

let camera;
let recorder;
let is_recording = false;

let hamMenuState = false;

if (JSON.parse(localStorage.getItem('favoritesIdArray')) != null) {
    favoritesIdArray = JSON.parse(localStorage.getItem('favoritesIdArray'));
}
if (JSON.parse(localStorage.getItem('myGif')) != null) {
    myGifArrayFromLS = JSON.parse(localStorage.getItem('myGif'));
}

let darkModeInit = localStorage.getItem('darkMode');
if (darkModeInit == 'true') {
    document.body.classList.toggle("dark");
}

// TRENDING SUGGESTION
async function trendigSearchTermsFetch() {
    let url = `https://api.giphy.com/v1/trending/searches?api_key=${GIPHY_KEY}`;
    let response = await fetch(url);
    let trendingSearchTermsArr = await response.json();
    return trendingSearchTermsArr.data;
}

// SEARCH FUNCTIONS
async function gifoSearchFetch(keyword) {

    console.log(keyword);

    let url = `https://api.giphy.com/v1/gifs/search?q=${keyword}&api_key=${GIPHY_KEY}&limit=${numGifSearch}`;
    let response = await fetch(url);
    let gifsSearchPromise = await response.json();
    return gifsSearchPromise.data;
}

function displaySearchGrid(gifsArray, init, finish) {
    let gifoGridElement = document.querySelector('#gifo-grid');

    let from = init;
    if (from == 'mygifos') {
        init = 0;
    }

    for (let i = init; i < finish; i++) {
        let gifoImg;
        let gifoUser;
        let gifoTitle;
        let gifId;

        let classLike = 'icon-like';

        if (from == 'mygifos') {
            gifoImg = new Image();
            gifoImg.src = gifsArray[i];
            gifoUser = 'Santi';
            gifoTitle = `Mi gifs #${i + 1}`;
            gifId = '';
        } else {
            gifoImg = new Image();
            gifoImg.src = gifsArray[i].url;
            gifoUser = gifsArray[i].username;
            gifoTitle = gifsArray[i].title;
            gifId = gifsArray[i].id;

            if (favoritesIdArray.indexOf(gifId) != -1) {
                classLike = 'icon-like__active';
            }
        }

        if (from == 'mygifos') {
            gifoGridElement.innerHTML +=
                `<div id="gifo-search-${i + 1}" class="gifo-card card-search">
            <img class="gifo-card__gif card-search" src=${gifoImg.src} alt="gifo search ${i + 1}">
            <div class="gifo-card__middle">
                <h2 class="gifo-card__user"> ${gifoUser} </h2>
                <h2 class="gifo-card__title"> ${gifoTitle} </h2>
                <div class="gifo-card__icons-group">
                    <div id="${i}" class="icon-delete" onclick="myApp.EventHandlers.addRemoveMyGifos(this.id)"></div>
                    <div id="${gifoImg.src}" class="icon-download" onclick="myApp.EventHandlers.downloadGif(this.id)"></div>
                    <div id="se-#${i}" class="icon-max" onclick="myApp.EventHandlers.expandGif('${gifId}', 'sr-#${i}')" ></div>
                </div>
            </div>
        </div>`;
        } else {
            gifoGridElement.innerHTML +=
                `<div id="gifo-search-${i + 1}" class="gifo-card card-search">
                <img class="gifo-card__gif card-search" src=${gifoImg.src} alt="gifo search ${i + 1}">
                <div class="gifo-card__middle">
                    <h2 class="gifo-card__user"> ${gifoUser} </h2>
                    <h2 class="gifo-card__title"> ${gifoTitle} </h2>
                    <div class="gifo-card__icons-group">
                        <div id="sr-#${i}" class="${classLike}" onclick="myApp.EventHandlers.addRemoveFavorite('${gifId}', this.id)"></div>
                        <div id="${gifoImg.src}" class="icon-download" onclick="myApp.EventHandlers.downloadGif(this.id)"></div>
                        <div id="se-#${i}" class="icon-max" onclick="myApp.EventHandlers.expandGif('${gifId}', 'sr-#${i}')" ></div>
                    </div>
                </div>
            </div>`;
        }
    }
}

function displaySearch(gifsSearchPromise, keyword) {
    for (let i = 0; i < gifsSearchPromise.length; i++) {
        class gifObjTren { };
        gifObjTren.id = gifsSearchPromise[i].id;
        gifObjTren.title = gifsSearchPromise[i].title;
        gifObjTren.username = gifsSearchPromise[i].username;
        gifObjTren.url = gifsSearchPromise[i].images.original.url;
        gifsSearchArray[i] = gifObjTren;
    }

    let gifosElement = document.querySelector('#gifos');
    //gifosElement.innerHTML = ''; // Clean the div before to add new grid of gifos

    gifosElement.innerHTML =
        `<div class="sec-search-display__line-top-result"></div>
            <h2 class="sec-search-display__title-result">${keyword}</h2>
        <div id="gifo-grid" class="sec-search-display__grid"></div>`;

    displaySearchGrid(gifsSearchArray, 0, numGifSearch / 2); // Show the rest of gifs (from #1 to #12)

    gifosElement.innerHTML +=
        `<div>
            <p id="see-more" onclick="myApp.EventHandlers.seeMore('search')" class="sec-search-display__see-more">VER MAS</p>
        </div>`;
}

function searchNotFound(keyword) {

    console.log('No se encontro nada');

    let gifosElement = document.querySelector('#gifos');
    gifosElement.innerHTML = ''; // Clean the div before to add new grid of gifos
    gifosElement.innerHTML +=
        `<div class="sec-search-display__line-top-result"></div>
        <h2 class="sec-search-display__title-result">${keyword}</h2>
        <img class="" src="/assets/icon-busqueda-sin-resultado.svg" alt="search not found">
        <h2 class="sec-search-display__title-result not-found">Intenta con otra busqueda</h2>`;

}

// TRENDING FUNCTIONS
async function gifoTrendingFetch() {
    let url = `https://api.giphy.com/v1/gifs/trending?&api_key=${GIPHY_KEY}&limit=${numGifTrending}`;
    let response = await fetch(url);
    let gifsTrendingPromise = await response.json();
    return gifsTrendingPromise.data;
}

function displayTrending(gifsTrendingPromise) {
    for (let i = 0; i < gifsTrendingPromise.length; i++) {
        class gifObjTren { };
        gifObjTren.id = gifsTrendingPromise[i].id;
        gifObjTren.title = gifsTrendingPromise[i].title;
        gifObjTren.username = gifsTrendingPromise[i].username;
        gifObjTren.url = gifsTrendingPromise[i].images.original.url;
        gifsTrendingArray[i] = gifObjTren;
    }

    displayTrendingCards(initTrendingCard);
}

function displayTrendingCards(init) {
    let cont = 0;

    for (let i = 0; i < 3; i++) {
        if (init >= 12) {
            init = 0;
        }

        let gifoImg = new Image();
        gifoImg.src = gifsTrendingArray[init].url;
        let gifoUser = gifsTrendingArray[init].username;
        let gifoTitle = gifsTrendingArray[init].title;
        let gifId = gifsTrendingArray[init].id;

        let classLike = 'icon-like';

        if (favoritesIdArray.indexOf(gifId) != -1) {
            classLike = 'icon-like__active';
        }

        let gifoTrending = document.querySelector(`#gifo-trendig-${cont + 1}`);

        gifoTrending.innerHTML +=
            `<img id="img-tr-${cont}" class="gifo-card__gif card-trending" src=${gifoImg.src} alt="gifo trending ${i + 1}">
            <div id="div-tr-${cont}" class="gifo-card__middle">
                <h2 class="gifo-card__user"> ${gifoUser} </h2>
                <h2 class="gifo-card__title"> ${gifoTitle} </h2>
                <div class="gifo-card__icons-group">
                    <div id="tr-#${i}" class="${classLike}" onclick="myApp.EventHandlers.addRemoveFavorite('${gifId}', this.id)"></div>
                    <div id="${gifoImg.src}" class="icon-download" onclick="myApp.EventHandlers.downloadGif(this.id)"></div>
                    <div id="te-#${i}" class="icon-max" onclick="myApp.EventHandlers.expandGif('${gifId}', 'tr-#${i}')" ></div>
                </div>
            </div>`;

        init++;
        cont++;
    }
}

async function gifoSuggest(keycode) {
    let url = `https://api.giphy.com/v1/gifs/search/tags?&api_key=${GIPHY_KEY}&q=${keycode}&limit=${numGifSuggest}`;
    //let url = `https://api.giphy.com/v1/tags/related/${keycode}?&api_key=${GIPHY_KEY}&limit=4`;
    let response = await fetch(url);
    let suggestedWord = await response.json();
    return suggestedWord;
}

function autocomplete() { // From w3school example adapted to my web page
    let inp = document.querySelector('#myInput');
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        let arr = [];

        gifoSuggest(val)
            .then(suggestedWords => {

                for (let i = 0; i < suggestedWords.data.length; i++) {
                    arr[i] = suggestedWords.data[i].name;
                }

                /*close any already open lists of autocompleted values*/
                closeAllLists();
                if (!val) { return false; }
                currentFocus = -1;

                /*create a DIV element that will contain the items (values):*/
                a = document.createElement("DIV");
                a.setAttribute("id", this.id + "autocomplete-list");
                a.setAttribute("class", "autocomplete-items");

                /*append the DIV element as a child of the autocomplete container:*/
                //this.parentNode.appendChild(a);
                document.querySelector('#append-list').appendChild(a);

                document.querySelector('#btn-close').style.visibility = 'visible';

                document.querySelector('#btn-search').style.left = '-2rem';
                document.querySelector('#btn-search').src = '/assets/icon-search-grey.png';

                document.querySelector('#btn-search-noc').style.left = '-2rem';

                /*for each item in the array...*/
                for (i = 0; i < arr.length; i++) {

                    /*check if the item starts with the same letters as the text field value:*/
                    if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                        /*create a DIV element for each matching element:*/
                        b = document.createElement("DIV");
                        b.innerHTML = `<img src='/assets/icon-search-grey.png'>`;

                        /*make the matching letters bold:*/
                        b.innerHTML += "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                        b.innerHTML += arr[i].substr(val.length);
                        /*insert a input field that will hold the current array item's value:*/
                        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                        /*execute a function when someone clicks on the item value (DIV element):*/
                        b.addEventListener("click", function (e) {
                            /*insert the value for the autocomplete text field:*/
                            inp.value = this.getElementsByTagName("input")[0].value;
                            myApp.EventHandlers.searchGifoSubmitClick();
                            /*close the list of autocompleted values,
                            (or any other open lists of autocompleted values:*/
                            closeAllLists();
                        });
                        a.appendChild(b);
                    }
                }
            });
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }

            let keyword = document.querySelector("#myInput").value;
            gifoSearchFetch(keyword)
                .then(gifsSearchPromise => {
                    if (gifsSearchPromise.length == 0) {
                        searchNotFound(keyword);
                    } else {
                        displaySearch(gifsSearchPromise, keyword);
                    }
                })
                .catch(err => console.log(err));
            closeAllLists();
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        document.querySelector('#btn-search').style.left = '';
        document.querySelector('#btn-search').src = '/assets/icon-search.svg';
        document.querySelector('#btn-search-noc').style.left = '';
        document.querySelector('#btn-close').style.visibility = 'hidden';

        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

let form;

function stop_recording() {
    //let form;
    let src;
    let blob;

    let video_container = document.querySelector('#video-element');
    let frameContainer = document.querySelector('#frameContainer');
    let imgElement = document.createElement('IMG');
    imgElement.setAttribute('id', 'gifRec');
    imgElement.classList.add('gifRec');

    recorder.camera.stop();

    blob = recorder.getBlob();
    form = new FormData();
    form.append("file", blob, 'test.gif');
    // here is where upload happens

    frameContainer.appendChild(imgElement);

    src = URL.createObjectURL(blob);
    imgElement.src = src;

    recorder.destroy();
    recorder = null;
    video_container.srcObject = null;

    is_recording = false;

    clearInterval(interval);

    let chrono = document.querySelector('#chronometer');
    chrono.textContent = 'REPETIR CAPTURA';
    chrono.setAttribute('id', 'repeat');
    chrono.setAttribute('onclick', 'myApp.EventHandlers.repeatRecGif()');

    let uploadButton = document.querySelector('#startButton');
    uploadButton.textContent = 'SUBIR GIFO';
    uploadButton.setAttribute('onclick', 'myApp.EventHandlers.uploadGif()');
}

let hours = `00`;
let minutes = `00`;
let seconds = `00`;
let interval;

function chronometer() {
    chronometerDisplay = document.querySelector('#chronometer');
    seconds++;
    if (seconds < 10) seconds = `0` + seconds

    if (seconds > 59) {
        seconds = `00`;
        minutes++;
        if (minutes < 10) minutes = `0` + minutes
    }
    if (minutes > 59) {
        minutes = `00`;
        hours++;
        if (hours < 10) hours = `0` + hours
    }
    chronometerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

function setMediaDevice() {
    let title = document.querySelector('#title-rec-box');
    let paragraph = document.querySelector('#paragraph-rec-box');
    let video_container = document.querySelector('#video-element');
    let pag_1 = document.querySelector('#pag-1');
    let pag_2 = document.querySelector('#pag-2');
    let button = document.querySelector('#startButton');

    let cam_options = {
        video: true,
        audio: false
    };

    let recorder_options = {
        type: "gif"
    };

    if (!navigator.mediaDevices.getUserMedia) {
        throw new Error("No camera");
    }

    navigator.mediaDevices.getUserMedia(cam_options)
        .then((response) => {
            if (title != null) {
                title.remove();
                paragraph.remove();
                pag_1.classList.remove('pag-active');
                pag_2.classList.add('pag-active');
            }
            button.style.display = 'block';
            button.innerHTML = 'GRABAR';
            button.setAttribute('onclick', 'myApp.EventHandlers.startRecGif()');

            camera = response;
            video_container.srcObject = camera;
            video_container.play();
            recorder = RecordRTC(camera, recorder_options);
        })
        .catch(err => {
            throw new Error(err);
        });
}

// MAIN APP FUNCTION
myApp.EventHandlers = {
    // CLICK EVENTS
    changeModeDark: function () {
        let darkMode = localStorage.getItem('darkMode');
        if (darkMode == null || darkMode == 'false') { // From Light to Dark
            localStorage.setItem('darkMode', true);
            document.body.classList.toggle("dark");
        } else if (darkMode == 'true') { // From Dark to Light
            localStorage.setItem('darkMode', false);
            document.body.classList.toggle("dark");
        }
    },
    cleanSearch: function () {
        document.querySelector("#myInput").value = "";
    },
    searchGifoSubmitClick: function () {
        let keyword = document.querySelector('#myInput').value;
        gifoSearchFetch(keyword, GIPHY_KEY)
            .then(gifsSearchPromise => {
                if (gifsSearchPromise.length == 0) {
                    searchNotFound(keyword);
                } else {
                    displaySearch(gifsSearchPromise, keyword);
                }
            })
            .catch(err => console.log(err));
    },
    seeMore: function (from) {
        let gifsArrayMore;
        let endMore;

        if (from == 'search') {
            gifsArrayMore = gifsSearchArray;
            endMore = numGifSearch;
        } else if (from == 'favorites') {
            gifsArrayMore = gifsFavoriteArray;
            endMore = gifsFavoriteArray.length;
        }

        displaySearchGrid(gifsArrayMore, numGifSearch / 2, endMore, 'se'); // Show the rest of gifs (from #13 to #24)
        document.querySelector('#see-more').remove();
    },
    addRemoveFavorite: function (gifId, elementId) {
        let iconLike = document.getElementById(elementId);
        let indexId = favoritesIdArray.indexOf(gifId);

        if (indexId != '-1') { // Remove ID from Local Storage
            iconLike.classList.replace('icon-like__active', 'icon-like'); // Change like icon
            favoritesIdArray.splice(indexId, 1); // Remove from favorite array
            localStorage.setItem('favoritesIdArray', JSON.stringify(favoritesIdArray)); // Save in Local Storage

        } else if (indexId == '-1') { // Add ID in the Local Storage
            favoritesIdArray.push(gifId);
            localStorage.setItem('favoritesIdArray', JSON.stringify(favoritesIdArray));
            iconLike.classList.replace('icon-like', 'icon-like__active');

            let findGifTre = gifsTrendingArray.filter(gif => gif.id == gifId);
            let findGifSer = gifsSearchArray.filter(gif => gif.id == gifId);

            if (findGifTre.length == 0 && findGifSer.length == 0) {
                findGif = JSON.parse(localStorage.getItem(gifId));
            } else if (findGifTre.length == 0) {
                findGif = findGifSer;
            } else if (findGifSer.length == 0) {
                findGif = findGifTre;
            }

            let gifFav = new gifObj;
            gifFav.id = gifId;
            gifFav.username = findGif[0].username;
            gifFav.title = findGif[0].title;
            gifFav.url = findGif[0].url;

            localStorage.setItem(gifId, JSON.stringify(gifFav));
        }
    },
    downloadGif: function (url) {
        (async () => {
            //create new a element
            let a = document.createElement('a');
            // get image as blob
            let response = await fetch(url);
            let file = await response.blob();
            // use download attribute https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#Attributes
            a.download = 'gif-downloaded';
            a.href = window.URL.createObjectURL(file);
            //store download url in javascript https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes#JavaScript_access
            a.dataset.downloadurl = ['application/octet-stream', a.download, a.href].join(':');
            //click on element to start download
            a.click();
            //document.removeChild(a);
        })();
    },
    expandGif: function (gifId, elementBack) {
        let expandCard = document.createElement('DIV');
        document.body.appendChild(expandCard);

        let classLike = 'icon-like';
        if (favoritesIdArray.indexOf(gifId) != -1) {
            classLike = 'icon-like__active';
        }

        let findGifTre = gifsTrendingArray.filter(gif => gif.id == gifId);
        let findGifSer = gifsSearchArray.filter(gif => gif.id == gifId);

        if (findGifTre.length == 0 && findGifSer.length == 0) {
            findGif = JSON.parse(localStorage.getItem(gifId));
        } else if (findGifTre.length == 0) {
            findGif = findGifSer[0];
        } else if (findGifSer.length == 0) {
            findGif = findGifTre[0];
        }

        let url = findGif.url;
        let title = findGif.title;
        let username = findGif.username;

        expandCard.innerHTML +=
            `<div id="expand" class="card-expand">
                <div class="card-expand__container">       
                    <img class="card-expand__container__close-icon" src="/assets/close.svg" alt="close icon" onclick="myApp.EventHandlers.closeExpand('${elementBack}', '${gifId}')">
                    <div id="arrow-left" class="card-expand__container__arrow-left sec-trending__icon-arrow-left" onclick="myApp.EventHandlers.leftArrowEx()"></div>
                    <img id="img-ex" class="card-expand__container__gif" src=${url} alt="gifo expanded">
                    <div id="arrow-right" class="card-expand__container__arrow-right sec-trending__icon-arrow-right" onclick="myApp.EventHandlers.rightArrowEx()"></div>
            
                    <h2 class="card-expand__container__user"> ${username} </h2>
                    <h2 class="card-expand__container__title"> ${title} </h2>

                    <div class="gifo-card__icons-group card-expand__container__exp-pos">
                       <div id="expanded" class="${classLike} exp-like" onclick="myApp.EventHandlers.addRemoveFavorite('${gifId}', this.id)"></div>
                       <div id="${url}" class="icon-download exp-dwld" onclick="myApp.EventHandlers.downloadGif(this.id)"></div>
                    </div>
                
                </div>
            </div>`;
    },
    closeExpand: function (elementBack, gifId) {
        backDiv = document.getElementById(elementBack);
        if (favoritesIdArray.indexOf(gifId) != -1) {
            backDiv.classList.replace('icon-like', 'icon-like__active');
        } else {
            backDiv.classList.replace('icon-like__active', 'icon-like');
        }
        document.querySelector('#expand').remove();
    },
    rightArrow: function () {

        document.getElementById('img-tr-0').remove();
        document.getElementById('div-tr-0').remove();
        document.getElementById('img-tr-1').remove();
        document.getElementById('div-tr-1').remove();
        document.getElementById('img-tr-2').remove();
        document.getElementById('div-tr-2').remove();

        initTrendingCard++;

        if (initTrendingCard == 12) {
            initTrendingCard = 0;
        }

        displayTrendingCards(initTrendingCard);
    },
    leftArrow: function () {

        document.getElementById('img-tr-0').remove();
        document.getElementById('div-tr-0').remove();
        document.getElementById('img-tr-1').remove();
        document.getElementById('div-tr-1').remove();
        document.getElementById('img-tr-2').remove();
        document.getElementById('div-tr-2').remove();

        initTrendingCard--;

        if (initTrendingCard < 0) {
            initTrendingCard = 11;
        }

        displayTrendingCards(initTrendingCard);
    },
    rightArrowEx: function () {
        console.log('Not implemented');
        // document.getElementById('img-ex').remove();

        // initTrendingCard ++;

        // if (initTrendingCard == 12) {
        //     initTrendingCard = 0;
        // }

        // displayTrendingCards(initTrendingCard);
    },
    leftArrowEx: function () {
        console.log('Not implemented');
        // document.getElementById('img-tr-0').remove();
        // document.getElementById('div-tr-0').remove();
        // document.getElementById('img-tr-1').remove();
        // document.getElementById('div-tr-1').remove();
        // document.getElementById('img-tr-2').remove();
        // document.getElementById('div-tr-2').remove();

        // initTrendingCard --;

        // if (initTrendingCard < 0) {
        //     initTrendingCard = 11;
        // }

        // displayTrendingCards(initTrendingCard);
    },
    goFavorites: function () {
        if (document.querySelector('#gifos') != null) {
            document.querySelector('#gifos').remove();
        }
        let secSearch = document.querySelector('#gifo-sec-search');
        if (secSearch === null) {
            document.querySelector('.create-gif').remove();
            document.querySelector('#main').innerHTML =
                `<section id="gifo-sec-search" class="sec-search"></section>
            <section class="sec-trending" id="sec-trending">
            <div class="sec-trending__title">
                <h2>Trending GIFOS</h2>
                <h3>Mira los últimos GIFO de nuestra comunidad.</h3>
            </div>

            <div class="sec-trending__gifs">
                <div id="arrow-left" class="sec-trending__icon-arrow-left" onclick="myApp.EventHandlers.leftArrow()">
                </div>

                <div id="gifo-trendig-1" class="gifo-card card-trending"></div>
                <div id="gifo-trendig-2" class="gifo-card card-trending"></div>
                <div id="gifo-trendig-3" class="gifo-card card-trending"></div>

                <div class="sec-trending__icon-arrow-right" onclick="myApp.EventHandlers.rightArrow()"></div>
            </div>
            </section>`;
            gifoTrendingFetch()
                .then(gifsTrendingPromise => displayTrending(gifsTrendingPromise))
                .catch(err => console.log('Error gifs trending promise: ' + err));
            secSearch = document.querySelector('#gifo-sec-search');

        }
        secSearch.innerHTML =
            `<div id="gifos" class="sec-favorites">
                <img class="" src="/assets/icon-favoritos.svg" alt="search not found">
                <h2> Favoritos </h2>
                <div id="gifo-grid" class="sec-search-display__grid favorites-grid"></div>
            </div>`;

        if (favoritesIdArray.length == 0) {
            secSearch.innerHTML +=
                `<img class="empty-fav-icon" src="/assets/icon-fav-sin-contenido.svg" alt="search not found">
            <h2 class="empty-fav-text"> "¡Guarda tu primer GIFO en Favoritos para que se muestre aquí!" </h2>`;

        } else {
            gifsFavoriteArray = [];
            for (let i = 0; i < favoritesIdArray.length; i++) {
                let objFromLocSto = JSON.parse(localStorage.getItem(favoritesIdArray[i]));
                gifsFavoriteArray.push(objFromLocSto);
            }
            let endMore;
            if (gifsFavoriteArray.length < 12) {
                endMore = gifsFavoriteArray.length;
            } else {
                let gifosElement = document.querySelector('#gifos');
                gifosElement.innerHTML +=
                    `<div>
                        <p id="see-more" onclick="myApp.EventHandlers.seeMore('favorites')" class="sec-search-display__see-more">VER MAS</p>
                    </div>`;
                endMore = 12;
            }
            displaySearchGrid(gifsFavoriteArray, 0, endMore);
        }
    },
    goMyGifos: function () {
        let myGifArrayFromLS = JSON.parse(localStorage.getItem('myGif'));

        if (document.querySelector('#gifos') != null) {
            document.querySelector('#gifos').remove();
        }
        let secSearch = document.querySelector('#gifo-sec-search');
        if (secSearch === null) {
            document.querySelector('.create-gif').remove();
            document.querySelector('#main').innerHTML =
                `<section id="gifo-sec-search" class="sec-search"></section>
            <section class="sec-trending" id="sec-trending">
            <div class="sec-trending__title">
                <h2>Trending GIFOS</h2>
                <h3>Mira los últimos GIFO de nuestra comunidad.</h3>
            </div>

            <div class="sec-trending__gifs">
                <div id="arrow-left" class="sec-trending__icon-arrow-left" onclick="myApp.EventHandlers.leftArrow()">
                </div>

                <div id="gifo-trendig-1" class="gifo-card card-trending"></div>
                <div id="gifo-trendig-2" class="gifo-card card-trending"></div>
                <div id="gifo-trendig-3" class="gifo-card card-trending"></div>

                <div class="sec-trending__icon-arrow-right" onclick="myApp.EventHandlers.rightArrow()"></div>
            </div>
            </section>`;
            gifoTrendingFetch()
                .then(gifsTrendingPromise => displayTrending(gifsTrendingPromise))
                .catch(err => console.log('Error gifs trending promise: ' + err));
            secSearch = document.querySelector('#gifo-sec-search');

        }
        secSearch.innerHTML =
            `<div id="gifos" class="sec-favorites">
                <img class="" src="/assets/icon-mis-gifos.svg" alt="search not found">
                <h2> Mis GIFOS </h2>
                <div id="gifo-grid" class="sec-search-display__grid favorites-grid"></div>
            </div>`;

        if (myGifArrayFromLS == null || myGifArrayFromLS.length == 0) {
            secSearch.innerHTML +=
                `<img class="empty-fav-icon" src="/assets/icon-mis-gifos-sin-contenido.svg" alt="search not found">
            <h2 class="empty-fav-text"> "¡Anímate a crear tu primer GIFO!" </h2>`;

        } else {
            //myGifArrayFromLS = []; //gifsFavoriteArray = [];
            displaySearchGrid(myGifArrayFromLS, 'mygifos', myGifArrayFromLS.length);
        }
    },
    createGif: function () {
        let main = document.querySelector('#main');
        main.innerHTML =
            `<div class="create-gif">

        <div class="create-gif__camara">
            <img id="cam" src="/assets/camara.svg" alt="camara de video">
            <img id="light" src="/assets/element-luz-camara.svg" alt="">
        </div>

        <div id="create-gif-center" class="create-gif__center">
            <div id="frameContainer" class="create-gif__center__frame">
                <h2 id="title-rec-box" class="create-gif__center__frame-title"> Aquí podrás <br> crear tus propios <span>GIFOS</span></h2>
                <p id="paragraph-rec-box"> ¡Crea tu GIFO en sólo 3 pasos! <br>
                    (sólo necesitas una cámara para grabar un video)</p>
                <div class="corner c1"></div>
                <div class="corner c2"></div>
                <div class="corner c3"></div>
                <div class="corner c4"></div>
                <video id="video-element"></video>
           </div>
           <div class="create-gif__center__pag">
               <div id="pag-1" class="pag">1</div>
               <div id="pag-2" class="pag">2</div>
               <div id="pag-3" class="pag">3</div>
           </div>    
           <div class="create-gif__center__line"></div>  
           <div id="startButton" class="create-gif__center__button" onclick="myApp.EventHandlers.displayCamera()"> COMENZAR </div>    
        </div>
  
        <div class="create-gif__pelicula">
            <img src="/assets/pelicula.svg" alt="">
        </div>
    </div>`;
    },
    displayCamera: function () {
        let button = document.querySelector('#startButton');
        button.style.display = 'none';

        let title = document.querySelector('#title-rec-box');
        title.innerText =
            `¿Nos das acceso 
         a tu cámara?`;
        let paragraph = document.querySelector('#paragraph-rec-box');
        paragraph.innerText =
            `El acceso a tu camara será válido sólo
         por el tiempo en el que estés creando el GIFO.`;

        let pag_1 = document.querySelector('#pag-1');
        pag_1.classList.add("pag-active");

        setMediaDevice();
    },
    startRecGif: function () {
        hours = `00`;
        minutes = `00`;
        seconds = `00`;
        let frameContainer = document.querySelector('#create-gif-center');
        let chronometerDisplay = document.createElement('DIV');
        chronometerDisplay.setAttribute('id', 'chronometer');
        frameContainer.appendChild(chronometerDisplay);

        interval = setInterval(chronometer, 1000);
        chronometerDisplay.textContent = `${hours}:${minutes}:${seconds}`;

        recorder.startRecording();
        recorder.camera = camera;
        is_recording = true;

        let button = document.querySelector('#startButton');
        button.setAttribute('onclick', 'recorder.stopRecording(stop_recording)');
        button.innerHTML = 'FINALIZAR';
    },
    repeatRecGif: function () {
        let imgMyGif = document.querySelector('#gifRec');
        imgMyGif.remove();

        document.querySelector('#repeat').remove();

        setMediaDevice();
    },
    uploadGif: function () {
        document.querySelector('#startButton').remove();
        document.querySelector('#repeat').remove();

        let pag_2 = document.querySelector('#pag-2');
        let pag_3 = document.querySelector('#pag-3');
        pag_2.classList.remove("pag-active");
        pag_3.classList.add("pag-active");

        let frameCont = document.querySelector('#frameContainer');

        frameCont.innerHTML +=
            `<div class="imgUpload"></div>
            <img class="iconUpload iconRotate" src="/assets/loader.svg" alt="imagen cargando...">
            <h1 class="textUpload"> Estamos subiendo tu GIFO </h1>`;

        fetch(urlUpload, {
            method: 'POST',
            body: form
        })
            .then(res => res.json())
            .then(data => {
                myGifId = data.data.id;
                //console.log(gifId);
                fetch(urlGetById + myGifId + key)
                    .then(res => res.json())
                    .then(data => {
                        myGifUrl = data.data.images.original.url;
                        myGifArray.push(myGifUrl);
                        localStorage.setItem('myGif', JSON.stringify(myGifArray));

                        document.querySelector('.iconUpload').setAttribute('src', '/assets/ok.svg');
                        document.querySelector('.iconUpload').classList.remove('iconRotate');
                        document.querySelector('.textUpload').textContent = 'GIFO subido con éxito';

                        document.querySelector('#frameContainer').innerHTML +=
                            `<div id="${myGifUrl}" class="icon-download2" onclick="myApp.EventHandlers.downloadGif(this.id)"></div>
                        <div class="icon-link" onclick="myApp.EventHandlers.copyLink()"></div>`;

                    })
            });
    },
    addRemoveMyGifos: function (id) {
        console.log(id);
        myGifArray = JSON.parse(localStorage.getItem('myGif'));
        myGifArray.splice(id, 1); // Remove from array
        localStorage.setItem('myGif', JSON.stringify(myGifArray));
        this.goMyGifos();
    },
    hamburguerMenu: function () {
        hamMenuState = !hamMenuState;

        //if(hamMenuState) {
        document.querySelector('#header__nav').classList.toggle('hamburguer-menu');
        //}
    },
    copyLink: function () {
        //console.log('Copy...');
        //console.log(myGifUrl);
        navigator.clipboard.writeText(myGifUrl);
    },
    showTrengingTerms: function(keyword) {
        console.log(keyword.id);

        let keyw = keyword.id;

        gifoSearchFetch(keyw)
        .then(gifsSearchPromise => {
            if (gifsSearchPromise.length == 0) {
                searchNotFound(keyword);
            } else {
                displaySearch(gifsSearchPromise, keyw);
            }
        })
        .catch(err => console.log(err)); 
    }
};

myApp.EventHandlers.cleanSearch();

autocomplete();

trendigSearchTermsFetch()
    .then(giftren => {
        let trenTerms = document.querySelector('#trenSearchTerms');

        for (let i = 0; i < 5; i++) {
            a = document.createElement('a');
            a.innerHTML += giftren[i];
            if (i != 4) {
                a.innerHTML += ', ';
            }

            a.setAttribute('id', giftren[i]);
            a.setAttribute('onclick', 'myApp.EventHandlers.showTrengingTerms(this)');
            trenTerms.appendChild(a);
        }
    })
    .catch(err => console.log('Error gifs trending search terms: ' + err));

gifoTrendingFetch()
    .then(gifsTrendingPromise => displayTrending(gifsTrendingPromise))
    .catch(err => console.log('Error gifs trending promise: ' + err));
