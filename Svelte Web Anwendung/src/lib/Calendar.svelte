<script>
  import { onMount } from "svelte";
  import Calendar from "@event-calendar/core";
  import TimeGrid from "@event-calendar/time-grid";
  import Popup from "./Popup.svelte"; // Import the Popup component

  export let data = [];

  let ec;
  let plugins = [TimeGrid];
  let options = {
    view: "timeGridWeek",
    eventSources: [],
  };
  let showPopup = false;
  let selectedEvent = null;

  onMount(() => {
    ec = new Calendar({
      target: document.querySelector(".ec-dark"),
      props: {
        plugins,
        options,
      },
    });
    // Add a click event listener to the calendar element
    document
      .querySelector(".ec-dark")
      .addEventListener("click", handleEventClick);
  });

  function addEventsToCalendar() {
    // Remove all existing events first
    ec.getEvents().forEach((event) => event.remove());

    data.forEach((event, index) => {
      ec.addEvent({
        id: `event-${index}`, // Adding a unique ID for each event
        title: event.Fach,
        start: `${event.Datum} ${event.Start}`,
        end: `${event.Datum} ${event.Ende}`,
        extendedProps: {
          Fachbereich: event.Fachbereich,
          Professor: event.Professor,
          Raum: event.Raum,
          Zeitraum: event.Zeitraum,
        },
      });
    });
  }

  $: {
    if (data.length > 0) {
      addEventsToCalendar();
    }
  }

  function handleEventClick(event) {
    const target = event.target.closest(".ec-event");
    console.log(target);

    if (target) {
      // Extract the text content from the time and title elements
      const timeElement = target.querySelector(".ec-event-time");
      const eventTimeText = timeElement ? timeElement.textContent.trim() : null;

      const titleElement = target.querySelector(".ec-event-title");
      const eventTitle = titleElement ? titleElement.textContent.trim() : null;

      console.log("Event Title:", eventTitle);

      // Format eventTimeText by removing AM/PM and trimming any extra spaces
      let formattedTime = eventTimeText.replace(/\s?(AM|PM)/g, "").trim();
      console.log("Formatted Time:", formattedTime);

      // Find the event in the data array by comparing 'Fach' and 'Zeitraum'
      const foundEvent = data.find((event) => {
        return event.Fach === eventTitle;
      });

      if (foundEvent) {
        const eventId = `event-${data.indexOf(foundEvent)}`;
        console.log("Found Event ID:", eventId);

        // Assuming ec.getEventById uses the eventId
        selectedEvent = ec.getEventById(eventId);
        console.log(selectedEvent);

        showPopup = true;
      } else {
        console.error("Event not found in data array.");
        console.log("Data Array:", data);
      }
    }
  }

  function closePopup() {
    showPopup = false;
    selectedEvent = null;
  }
</script>

<div>
  {#if showPopup}
    <Popup {selectedEvent} on:close={closePopup} />
  {/if}
  <div class="ec-dark"></div>
</div>

<style>
  .ec {
    width: 100%;
    height: 100%;
    --ec-bg-color: #f0f0f0;
  }
  .ec-dark {
    width: 100%;
    height: 100%;
    --ec-bg-color: #424242;
  }
</style>
