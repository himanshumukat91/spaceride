let store = {
    user: { name: "Student" },
    rovers: ['curiosity', 'opportunity', 'spirit'],
    page: 1,
    selectedRover: 'curiosity',
    showInfo: false,
    roverDetails: {
        name: 'curiosity',
        landing_date: "2012-08-06",
        launch_date: "2011-11-26",
        status: "active",
        max_sol: 2540,
        max_date: "2019-09-28",
        total_photos: 366206,
        images: [
            {
                url: "http://mars.jpl.nasa.gov/msl-raw-images/msss/00001/mcam/0001ML0000001000C0_DXXX.jpg",
                camera: "MAST",
            }
        ],
    },
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}
 
const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    let { rovers, roverDetails, page } = state

    return `
        <header >
            ${header()}
            ${menubar(rovers)}
        </header>
        <main class="image-container">
            ${roverDetails && roverDetails.images && roverDetails.images.length
                ?roverDetails.images.map((image) => imageHolder(image.url)).join('')
                :null
            }
        </main>
        <footer>
            ${pageActions(page)}
        </footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


// Backend requests
const selectRover = (name) => {
    getRoverImages(store, name, 1);
}

const setSol = (page) => {
    if(page > store.roverDetails.max_sol)
        page = 1;
    else if(page < 1)
        page = store.roverDetails.max_sol;

    getRoverImages(store, store.selectedRover, page);
}

// ------------------------------------------------------  COMPONENTS
// Top menu bar of the application which gives option to choose between different rovers
const menubar = (menuItems) => {
    return `
        <div class="menu">
            ${menuItems.map(item => `<div class="menu-button" onclick="selectRover('${item}')">${item}</div>`).join('')}
        </div>
    `
}

const imageHolder = (url) => {
    return `<img class="image-holder" src="${url}"/>`;
}

const pageActions = (page) => {
    return `
        <div class="footer-button" onclick="setSol(${page - 1})">Previous</div>
        <div class="footer-button" onclick="setSol(${1})">Latest</div>
        <div class="footer-button" onclick="setSol(${page + 1})">Next</div>
    `
}

// Header
const header = () => {
    return `<div style="display:flex; justify-content: space-between">Space View</div>`;
}

// Example of a pure function that renders infomation requested from the backend
// const ImageOfTheDay = (apod) => {

//     // If image does not already exist, or it is not from today -- request it again
//     const today = new Date()
//     const photodate = new Date(apod.date)
//     console.log(photodate.getDate(), today.getDate());

//     console.log(photodate.getDate() === today.getDate());
//     if (!apod || apod.date === today.getDate() ) {
//         getImageOfTheDay(store)
//     }

//     // check if the photo of the day is actually type video!
//     if (apod.media_type === "video") {
//         return (`
//             <p>See today's featured video <a href="${apod.url}">here</a></p>
//             <p>${apod.title}</p>
//             <p>${apod.explanation}</p>
//         `)
//     } else {
//         return (`
//             <img src="${apod.image.url}" height="350px" width="100%" />
//             <p>${apod.image.explanation}</p>
//         `)
//     }
// }

// ------------------------------------------------------  API CALLS

const getRoverImages = (state, name, newSol) => {
    let { sol, selectedRover } = state;

    if(name !== undefined) 
        selectedRover = name;
    if(newSol !== undefined) 
        sol = newSol;

    fetch(`http://localhost:3000/rover/${selectedRover}/${sol}`)
        .then(res => res.json())
        .then(roverDetails => {
            updateStore(store, { selectedRover, sol, roverDetails: !roverDetails.error?roverDetails:state.roverDetails });
        });

    return;
}