let store = {
    user: { name: "Student" },
    rovers: ['curiosity', 'opportunity', 'spirit'],
    sol: 1,
    maxPages: 3,
    selectedRover: 'curiosity',
    showInfo: false,
    roverDetails: {
        name: 'curiosity',
        landing_date: "2012-08-06",
        launch_date: "2011-11-26",
        status: "active",
        max_sol: 0,
        max_date: "2019-09-28",
        total_photos: 0,
        images: [
        ],
    },
};

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
    let { rovers, roverDetails, sol, showInfo } = state

    return `
        <header >
            <div style="display:flex; justify-content: space-between">Space View</div>
            ${menubar(rovers)}
        </header>
        <main>
            <div class="image-container">
                ${roverDetails && roverDetails.images && roverDetails.images.length
                    ?roverDetails.images.map((image) => imageHolder(image.url)).join('')
                    :''
                }
            </div>
            ${showInfo
                ?roverInfo(roverDetails)
                :''
            }
        </main>
        <footer>
            ${pageActions(sol)}
        </footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getRoverImages(store, store.selectedRover, store.sol)
    // render(root, store)
})

// Backend requests
const selectRover = (name) => {
    getRoverImages(store, name, 1);
}

const setSol = (sol) => {
    if(sol > store.roverDetails.max_sol)
        sol = 1;
    else if(sol < 1)
        sol = store.roverDetails.max_sol;

    getRoverImages(store, store.selectedRover, sol);
}

toggleRoverInfo = () => {
    updateStore(store, {showInfo: !store.showInfo})
}


// ------------------------------------------------------  COMPONENTS
// Top menu bar of the application which gives option to choose between different rovers
const menubar = (menuItems) => {
    return `
        <div class="menu">
            ${menuItems.map(item => `
                <div class="menu-button ${store.selectedRover === item?'active-menu':''}" onclick="selectRover('${item}')">${item}</div>
            `).join('')}
        </div>
    `
}

const imageHolder = (url) => {
    return `<img class="image-holder" src="${url}"/>`;
}

const pageActions = (sol) => {
    return `
        <div class="footer-button" onclick="setSol(${sol - 1})">Previous</div>
        <div class="footer-button ${store.showInfo?'active-menu':''}" onclick="toggleRoverInfo()">Show Info</div>
        <div class="footer-button" onclick="setSol(${sol + 1})">Next</div>
    `
}

const roverInfo = (roverDetails) => {
    return `
        <div class="info-container">
            <div class="info-field">
                <p>Name </p>
                <p>Launch Date </p>
                <p>Landing Date </p>
                <p>Status </p>
                <p>Total Photos </p>
            </div>
            <div class="info-value">
                <p>: ${roverDetails.name}</p>
                <p>: ${roverDetails.launch_date}</p>
                <p>: ${roverDetails.landing_date}</p>
                <p>: ${roverDetails.status}</p>
                <p>: ${roverDetails.total_photos}</p>
            </div>
        </div>
    `
}


// ------------------------------------------------------  API CALLS
const getRoverImages = (state, name, newSol) => {
    let { sol, selectedRover } = state;

    if(name !== undefined) 
        selectedRover = name;
    if(newSol !== undefined) 
        sol = newSol;

    // Not doing it will make the UI lag but will avoid rendering images twice
    // updateStore(store, { selectedRover, sol});

    fetch(`http://localhost:3000/rover/${selectedRover}/${sol}`)
        .then(res => res.json())
        .then(roverDetails => {
            updateStore(store, { selectedRover, sol, roverDetails: !roverDetails.error?roverDetails:state.roverDetails });
        });

    return;
}