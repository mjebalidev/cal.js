<script>
  import { createEventDispatcher } from "svelte";

  export let selectedEvent;

  const dispatch = createEventDispatcher();

  async function createLecture() {
    try {
      const response = await fetch(
        "http://localhost:8088/restapi/repo/courses",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: selectedEvent.title,
          }),
        }
      );

      if (response.ok) {
        console.log("Lecture created successfully");
        // Optionally handle success, e.g., show a success message
      } else {
        console.error("Failed to create lecture");
        // Optionally handle failure, e.g., show an error message
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
    }
  }

  async function createGroup() {
    try {
      const response = await fetch("http://localhost:8088/restapi/groups", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedEvent.extendedProps.Fachbereich,
        }),
      });

      if (response.ok) {
        console.log("Group created successfully");
        // Optionally handle success, e.g., show a success message
      } else {
        console.error("Failed to create group");
        // Optionally handle failure, e.g., show an error message
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }

  function createCalendar() {
    console.log("Create Calendar functionality not yet implemented");
    // Add your logic for creating a calendar
  }

  function close() {
    dispatch("close");
  }
</script>

<div class="popup">
  <h2>Event Aktionen</h2>
  <div>
    <button on:click={createLecture}>Kurs Erstellen</button>
    <button on:click={createGroup}>Gruppe Erstellen</button>
    <button on:click={createCalendar}>Calendar Erstellen</button>
  </div>

  <h3>Event Details</h3>
  <p><strong>Fach:</strong> {selectedEvent.title}</p>
  <p><strong>Fachbereich:</strong> {selectedEvent.extendedProps.Fachbereich}</p>
  <p><strong>Professor:</strong> {selectedEvent.extendedProps.Professor}</p>
  <p><strong>Raum:</strong> {selectedEvent.extendedProps.Raum}</p>
  <p><strong>Zeitraum:</strong> {selectedEvent.extendedProps.Zeitraum}</p>
  <p><strong>Start:</strong> {new Date(selectedEvent.start).toISOString()}</p>
  <p><strong>Ende:</strong> {new Date(selectedEvent.end).toISOString()}</p>

  <br />

  <button on:click={close}>Close</button>
</div>

<style>
  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgb(144, 130, 130);
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    color: black;
  }
</style>
