<script>
  import { onMount } from "svelte";
  import moment from "moment";
  import Calendar from "./lib/Calendar.svelte";
  import Logo from "./assets/Hochschule_Koblenz.svg";
  import Accordion from "./lib/Accordion.svelte";
  import { DateInput } from "date-picker-svelte";

  let data = [];
  let selectedTimeRange = "set1";
  let fileInput;
  let fileContent;
  let date = new Date();
  let startDate;

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file && (file.type === "text/plain" || file.type === "text/csv")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        fileContent = e.target.result;
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a .txt or .csv file.");
    }
  }

  function transformTimeRange(selectedTimeRange) {
    switch (selectedTimeRange) {
      case "set1":
        return [
          "8:15 - 9:45",
          "10:00 - 11:30",
          "12:15 - 13:45",
          "14:00 - 15:30",
          "15:45 - 17:15",
        ];
      case "set2":
        return [
          "8:15 - 9:45",
          "10:00 - 11:30",
          "11:45 - 13:15",
          "14:00 - 15:30",
          "15:45 - 17:15",
        ];
      default:
        console.error("Invalid selectedTimeRange:", selectedTimeRange);
        return [];
    }
  }

  function processData(content) {
    if (content === undefined) {
      alert("Please upload a file first.");
      return [];
    }
    const lines = content.split("\n");
    return lines
      .map((line) => {
        const values = line
          .split(",")
          .map((item) => item.trim().replace(/"/g, ""));
        const timeRange = transformTimeRange(selectedTimeRange);
        const index = parseInt(values[5]) - 1;

        if (!timeRange[index]) {
          console.log("Invalid index or time range:", {
            selectedTimeRange,
            values,
            index,
            timeRange,
          });
          return null; // or handle the error appropriately
        }

        //const dayOfWeek = parseInt(values[6]); // Convert Tag from string to number
        const dayOfSemester = parseInt(values[0]); // Convert TagDesSemesters from string to number

        const eventDate = moment(startDate)
          .startOf("week")
          .add(dayOfSemester, "days")
          //.add(dayOfWeek - 1, "days") // Adjust by dayOfWeek to get the exact date
          .format("YYYY-MM-DD");

        //console.log("Event Date:", eventDate);

        return {
          Fachbereich: values[1],
          Professor: values[2],
          Fach: values[3],
          Raum: values[4],
          Zeitraum: timeRange[index],
          Start: timeRange[index].split(" - ")[0],
          Ende: timeRange[index].split(" - ")[1],
          Datum: eventDate,
        };
      })
      .filter((event) => event !== null); // Remove any null events
  }

  function submitForm() {
    //const startDate = moment(startDateString, "YYYY-MM-DD", true);

    const dateToString = date.toLocaleDateString();
    //Transform from MM/DD/YYYY to YYYY-MM-DD

    console.log(dateToString);
    const startDateTemp = moment(dateToString, "MM/DD/YYYY").format(
      "YYYY-MM-DD"
    );
    console.log(startDateTemp);
    startDate = moment(startDateTemp, "YYYY-MM-DD", true);

    if (startDate.isValid()) {
      console.log("Processing Data ...");
      data = processData(fileContent);
      // Make sure there are no duplicate events
      data = data.filter(
        (event, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.Fach === event.Fach &&
              t.Professor === event.Professor &&
              t.Raum === event.Raum &&
              t.Zeitraum === event.Zeitraum &&
              t.Datum === event.Datum
          )
      );
      console.log(data);
    } else {
      alert("Invalid date format. Please enter a valid date (YYYY-MM-DD).");
    }
  }

  function exportToICal() {
    // Logic to export to iCal
  }

  onMount(() => {
    // Initialize fullCalendar here
  });
</script>

<div class="container">
  <div class="image-container">
    <img src={Logo} alt="Logo" class="image" />
  </div>
  <div class="sidebar">
    <button
      id="drop-area"
      on:click={() => fileInput.click()}
      on:keydown={(e) => {
        if (e.key === "Enter") fileInput.click();
      }}
    >
      <label id="drop-area" for="fileInput">
        <h3>Drag and Drop a .txt or .csv file here</h3>
        <input
          type="file"
          id="fileInput"
          style="display: none"
          accept=".txt, .csv"
          on:change={handleFileChange}
          bind:this={fileInput}
        />
      </label>
    </button>
    <br />
    <label for="timeRangeSelect">Select Time Range:</label>
    <select id="timeRangeSelect" bind:value={selectedTimeRange}>
      <option value="set1">Eul, M (Mo-Fr)</option>
      <option value="set2">BWL, SW (Mo-Fr) Bau, A(Mo-Fr)</option>
    </select>
    <br />
    <DateInput bind:value={date} format="yyyy-MM-dd" />
    <br />
    <!-- Add username and password fields -->
    <input type="text" placeholder="Enter username" value="administrator" />
    <input type="password" placeholder="Enter password" value="openolat" />
    <br />
    <button on:click={submitForm}>Submit</button>
    <button on:click={exportToICal}>Export to iCal</button>

    <div class="accordion">
      <Accordion>
        <h4 id="result" slot="head">Result</h4>
        <div slot="details">
          <!-- Display the content of the file -->
          <p>Content of the file:</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </Accordion>
    </div>
  </div>
  <div class="calendar-container">
    <Calendar {data} />
  </div>
</div>

<style>
  #drop-area {
    border-radius: 20px;
    width: 500px;
    height: 200px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .container {
    display: flexbox;
    width: 70vw;
  }

  .sidebar {
    padding: 20px;
    background-color: #201f1f;
  }

  .calendar-container {
    padding: 20px;
  }

  .image-container {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .image {
    width: 40%;
    height: auto;
  }

  .accordion {
    margin-top: 20px;
  }
  :root {
    --date-picker-background: #292828;
    --date-picker-foreground: #f7f7f7;
  }
  :global(.date-time-picker) {
  }
</style>
