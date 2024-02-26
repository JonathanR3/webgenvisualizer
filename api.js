const hospitalsURL = "https://www.communitybenefitinsight.org/api/get_hospitals.php?state=";
let currentState = "";
let fetchURL = "";
let hospitalList;
const individualHospitalURL = "https://www.communitybenefitinsight.org/api/get_hospital_data.php?hospital_id="
let hospitalID = "";
let hospitalURL = "";
let hospitalInfo;
let dataChosen = "";

let year = [];
let yearData = [];


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
            chooseDimensions();
        })
        listContainer.appendChild(currentHospital);
    });
}

function chooseDimensions() {
    let listContainer = document.getElementById("hospital-list");
    listContainer.innerHTML = "";

    let buttonCont = document.createElement("div");
    buttonCont.id = "button-container";

    let dropDownButton = document.createElement("button");
    dropDownButton.textContent = "Choose Metric";
    dropDownButton.classList.add("drop-down-button");

    let dropDownContent = document.createElement("div");
    dropDownContent.classList.add("drop-down-content");
    dropDownContent.id = "myDropDown";

    let choices = ["Total Functional Expenses", "Total Revenue", "Total Community Benefits", "Quartile of Percent Persons in Poverty"];
    choices.forEach( (opt) => {
        dropDownContent.appendChild(createList(opt));
    })

    dropDownButton.addEventListener("click", () => {
        document.getElementById("myDropDown").classList.toggle("show-menu");
    })

    window.onclick = (event) => {
        if (!event.target.matches(".drop-down-button")) {
            let dropDown = document.getElementsByClassName("drop-down-content");
            for (let i = 0; i < dropDown.length; i++) {
                let openDropDown = dropDown[i];
                if (openDropDown.classList.contains('show-menu')) {
                    openDropDown.classList.remove('show-menu');
                }
            }
        }
    }
    dropDownButton.appendChild(dropDownContent);
    buttonCont.appendChild(dropDownButton);
    listContainer.appendChild(buttonCont);
}

function createList(content) {
    let option = document.createElement("a");
    option.href = "#";
    option.textContent = content;
    option.addEventListener("click", () => {
        dataChosen = content;
        fetchCurrentHospital();
    })
    return option;
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
    yearData = [];
    let listContainer = document.getElementById("hospital-chart");
    listContainer.innerHTML = "";

    hospitalInfo.forEach( (id) => {
        hospitalName = id.data_name;
        year.push( `${id.fiscal_yr}`);
        switch (dataChosen) {
            case "Total Functional Expenses":
                yearData.push(`${id.tot_func_exp}`);
                break;
            case "Total Revenue":
                yearData.push(`${id.tot_revenue}`);
                break;
            case "Total Community Benefits":
                yearData.push(`${id.tot_comm_bnfts}`);
                break;
            case "Quartile of Percent Persons in Poverty":
                yearData.push(`${id.percent_ppl_pov_qrt}`);
                break;
            default:
                console.log("Something went wrong");
        }
    });
    let plot = [{
        x: year,
        y: yearData,
        type: "bar",
        orientation:"v",
        marker: {
            color: "#1A3C47"
        }
    }];
    let layout = {
        title: dataChosen + " Every Fiscal Year at " + `${hospitalName}`,
        plot_bgcolor: "#FFE4B5",
        paper_bgcolor: "#8FBC8F"
    }
    Plotly.newPlot(listContainer, plot, layout);


}
