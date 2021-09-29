import "./styles.css";
import * as pack from "../package.json";

const ObjectsToCsv = require("objects-to-csv");

let csvToJson = require("convert-csv-to-json");
let facilities = [];
let loans = [];
let covenants = [];
let banks = [];
let expectedYields = {};
let finalExpectedYields = [];
let assignments = [];

let banksJson =
  pack.data === "Small"
    ? csvToJson.fieldDelimiter(",").getJsonFromCsv("/src/input/small/banks.csv")
    : csvToJson
        .fieldDelimiter(",")
        .getJsonFromCsv("/src/input/large/banks.csv");
for (let i = 0; i < banksJson.length; i++) {
  banks.push(banksJson[i]);
}
banksJson = facilities.sort(function (a, b) {
  return a.id - b.id;
});

let facilitiesJson =
  pack.data === "Small"
    ? csvToJson
        .fieldDelimiter(",")
        .getJsonFromCsv("/src/input/small/facilities.csv")
    : csvToJson
        .fieldDelimiter(",")
        .getJsonFromCsv("/src/input/large/facilities.csv");
for (let i = 0; i < facilitiesJson.length; i++) {
  facilities.push(facilitiesJson[i]);
}
facilities = facilities.sort(function (a, b) {
  return a.id - b.id;
});

let covenantsJson =
  pack.data === "Small"
    ? csvToJson
        .fieldDelimiter(",")
        .getJsonFromCsv("/src/input/small/covenants.csv")
    : csvToJson
        .fieldDelimiter(",")
        .getJsonFromCsv("/src/input/large/covenants.csv");
for (let i = 0; i < covenantsJson.length; i++) {
  console.log(JSON.stringify(covenantsJson[i]));
  covenants.push(covenantsJson[i]);
}

let loansJson =
  pack.data === "Small"
    ? csvToJson.fieldDelimiter(",").getJsonFromCsv("/src/input/small/loans.csv")
    : csvToJson
        .fieldDelimiter(",")
        .getJsonFromCsv("/src/input/large/loans.csv");
for (let i = 0; i < loansJson.length; i++) {
  loans.push(loansJson[i]);
}
loansJson = loansJson.sort(function (a, b) {
  return a.id - b.id;
});

let checkForCovenants = (loan) => {
  let excludeFacilities = [];
  covenants.forEach((covenant) => {
    if (
      loan.state === covenant.banned_state &&
      !excludeFacilities.includes(covenant.facility_id)
    ) {
      excludeFacilities.push(covenant.facility_id);
    }
    if (
      parseFloat(loan.default_likelihood) >
        parseFloat(covenant.max_default_likelihood) &&
      !excludeFacilities.includes(covenant.facility_id)
    ) {
      excludeFacilities.push(covenant.facility_id);
    }
  });
  console.log(excludeFacilities);
  return excludeFacilities;
};

let calculateYield = (loan, facility_interest_rate) => {
  let expected_yield =
    (1 - loan.default_likelihood) * loan.interest_rate * loan.amount -
    loan.default_likelihood * loan.amount -
    facility_interest_rate * loan.amount;

  return expected_yield;
};

let CreateTableFromJSON = (data) => {
  var col = [];
  for (var i = 0; i < data.length; i++) {
    for (var key in data[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }

  var table = document.createElement("table");

  var tr = table.insertRow(-1);

  for (var i = 0; i < col.length; i++) {
    var th = document.createElement("th");
    th.innerHTML = col[i];
    tr.appendChild(th);
  }

  for (var i = 0; i < data.length; i++) {
    tr = table.insertRow(-1);

    for (var j = 0; j < col.length; j++) {
      var tabCell = tr.insertCell(-1);
      tabCell.innerHTML = data[i][col[j]];
    }
  }

  return table;
};

loans.forEach((loan) => {
  let excludeFacilities = checkForCovenants(loan);
  for (let i = 0; i < facilities.length; i++) {
    if (
      !excludeFacilities.includes(facilities[i].id) &&
      loan.amount < facilities[i].amount
    ) {
      facilities[i].amount = facilities[i].amount - loan.amount;
      if (expectedYields[facilities[i].id]) {
        expectedYields[facilities[i].id] += Math.round(
          calculateYield(loan, facilities[i].interest_rate)
        );
      } else {
        expectedYields[facilities[i].id] = Math.round(
          calculateYield(loan, facilities[i].interest_rate)
        );
      }
      assignments.push({ loan_id: loan.id, facility_id: facilities[i].id });
      break;
    }
  }
});

for (let x in expectedYields) {
  finalExpectedYields.push({
    facility_id: x,
    expected_yield: expectedYields[x]
  });
}

(async () => {
  const csv = new ObjectsToCsv(finalExpectedYields);
  await csv.toDisk("./yields.csv");
})();

(async () => {
  const csv = new ObjectsToCsv(assignments);
  await csv.toDisk("./assignments.csv");
})();

document.getElementById("app").innerHTML = `
<style>
    th, td, p, input {
        font:14px Verdana;
    }
    table, th, td 
    {
        border: solid 1px #DDD;
        border-collapse: collapse;
        padding: 2px 3px;
        text-align: center;
    }
    th {
        font-weight:bold;
    }
</style>
<h1>DataSet: <span id="showDataSet"></span></h1>
<h2>Yields</h2>
<p id="showYields"></p>
<h2>Assignments</h2>
<p id="showAssignments"></p>
`;

document.getElementById("showYields").innerHTML = ``;
document
  .getElementById("showYields")
  .appendChild(CreateTableFromJSON(finalExpectedYields));
document.getElementById("showAssignments").innerHTML = ``;
document
  .getElementById("showAssignments")
  .appendChild(CreateTableFromJSON(assignments));
document.getElementById("showDataSet").innerHTML = pack.data;
