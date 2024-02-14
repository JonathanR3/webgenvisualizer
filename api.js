const hospitalsURL = "https://www.communitybenefitinsight.org/api/get_hospitals.php?state=";
let currentState = "";
let fetchURL = "";
let hospitalList;
const individualHospitalURL = "https://www.communitybenefitinsight.org/api/get_hospital_data.php?hospital_id="
let hospitalID = "";
let hospitalURL = "";
let hospitalInfo;

let year = [];
let revenue = [];


document.addEventListener("DOMContentLoaded", function() {
    let svgMap = document.querySelectorAll('svg > path');
    let toolTip = document.getElementById("tooltip");

    svgMap.forEach(function(path) {
        path.addEventListener("mouseover", (event) => {
            let state = event.target.getAttribute('data-name');
            toolTip.textContent = state;
        });

        path.addEventListener("mouseout", () => {
            toolTip.textContent = "";
        });

        path.addEventListener("click", (event) => {
            currentState = event.target.getAttribute('id');
            fetchURL = "https://corsproxy.io/?" + hospitalsURL + currentState;
            fetchHospitals();
        })
        
    })
})

async function fetchHospitals() {
    try {
        const res = await fetch(fetchURL);
        const data = await res.json();
        if (!res.ok) {
            console.log("Hospital List Fetch Error");
            return;
        }
        hospitalList = data;
        listHospitals();
    }
    catch (error) {
        console.log(error);
    }
}

function listHospitals() {
    let listContainer = document.getElementById("hospital-list");
    listContainer.innerHTML = "";
    hospitalList.forEach(hospital => {
        let currentHospital = document.createElement("li");
        currentHospital.textContent = `${hospital.name}, ${hospital.street_address}, ${hospital.zip_code}`;
        currentHospital.classList.add("each-hospital")
        currentHospital.addEventListener("click", () => {
            hospitalID = `${hospital.hospital_id}`;
            console.log(hospitalID);
            hospitalURL = "https://corsproxy.io/?" + individualHospitalURL + hospitalID;
            console.log(hospitalURL);
            fetchCurrentHospital();
        })
        listContainer.appendChild(currentHospital);
    });
}

async function fetchCurrentHospital() {
    try {
        const res = await fetch(hospitalURL);
        const data = await res.json();
        if (!res.ok) {
            console.log("Hospital Fetch Error");
            return;
        }
        hospitalInfo = data;
        listRevenue();
    }
    catch (error) {
        console.log(error);
    }
}

function listRevenue() {
    let hospitalName = "";
    year = [];
    revenue = [];
    let listContainer = document.getElementById("hospital-list");
    listContainer.innerHTML = "";
    hospitalInfo.forEach(id => {
        hospitalName = id.data_name;
        year.push( `${id.fiscal_yr}`);
        revenue.push(`${id.tot_revenue}`);
    });
    let plot = [{
        x: year,
        y: revenue,
        type: "bar",
        orientation:"v",
        marker: {
            color: "#1A3C47"
        }
    }];
    let layout = {
        title:"Total Revenue Every Fiscal Year at " + `${hospitalName}`,
        plot_bgcolor: "lightgray",
        paper_bgcolor: "#98AEB6"
    }
    Plotly.newPlot(listContainer, plot, layout);


}

