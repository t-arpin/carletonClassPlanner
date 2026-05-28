const START = 8 * 60;
const END = 20 * 60;
const HEIGHT = 900;

function toMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function timeToY(min) {
    return ((min - START) / (END - START)) * HEIGHT;
}

function renderCalendar() {
    const selectedCourses = getSchedule();
    const container = document.getElementById("calendar");
    container.innerHTML = "";

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    days.forEach((day, i) => {
        const col = document.createElement("div");
        col.style.gridColumn = i + 1;
        col.style.position = "relative";

        selectedCourses.forEach(course => {
            if (!course.days.includes(day)) return;

            const start = toMinutes(course.start_time);
            const end = toMinutes(course.end_time);

            const block = document.createElement("div");
            block.className = "block";

            block.style.top = timeToY(start) + "px";
            block.style.height = (timeToY(end) - timeToY(start)) + "px";

            block.innerHTML = `
                <div style="
                    font-weight: 700;
                    font-size: 11px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    
                </div>

                <div style="
                    font-size: 10px;
                    opacity: 0.95;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    <b>${course.title}</b> ${course.course}
                </div>

                <div style="
                    font-size: 10px;
                    opacity: 0.85;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    ${course.instructor} • ${course.rating}
                </div>

                <div style="
                    font-size: 10px;
                    opacity: 0.75;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    ${course.schedule_type} • ${course.building}
                </div>
            `;

            /* conflict detection */
            const conflict = selectedCourses.some(other => {
                if (other === course) return false;
                if (!other.days.includes(day)) return false;

                return (
                    toMinutes(other.start_time) < end &&
                    toMinutes(other.end_time) > start
                );
            });

            if (conflict) {
                block.classList.add("conflict");
            }

            col.appendChild(block);
        });

        container.appendChild(col);
    });
}

function getSchedule() {
    const session = document.getElementById("Session").value
    if (session == 202630) {
        return JSON.parse(localStorage.getItem("schedule-fall")) || [];
    }
    if (session == 202710) {
        return JSON.parse(localStorage.getItem("schedule-winter")) || [];
    }
}

function saveSchedule(data) {
    const session = document.getElementById("Session").value
    if (session == 202630) {
        localStorage.setItem("schedule-fall", JSON.stringify(data));
    }
    if (session == 202710) {
        localStorage.setItem("schedule-winter", JSON.stringify(data));
    }
}

function renderSidebar() {
    const container = document.getElementById("courseList");
    console.log(localStorage.getItem("Session"));
    document.getElementById("Session").value = localStorage.getItem("session");
    container.innerHTML = "";

    const schedule = getSchedule();

    schedule.forEach(course => {
        const div = document.createElement("div");
        div.className = "course-item";

        div.innerHTML = `
            <div>
                <b>${course.course}</b><br>
                <small>${course.section}</small>
            </div>

            <button onclick="removeCourse('${course.crn}')">
                ✕
            </button>
        `;

        container.appendChild(div);
    });
}

function removeCourse(crn) {
    let schedule = getSchedule();

    schedule = schedule.filter(c => c.crn !== crn);

    saveSchedule(schedule);

    renderSidebar();
    renderCalendar();
}

function renderTimeLabels() {
    const container = document.getElementById("timeLabels");

    container.innerHTML = "";

    const START_HOUR = 8;
    const END_HOUR = 20;
    const HEIGHT = 900;

    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {

        const div = document.createElement("div");

        div.className = "time-label";

        const y =
            ((hour - START_HOUR) / (END_HOUR - START_HOUR)) * HEIGHT;

        div.style.top = `${y}px`;

        div.textContent = `${hour}:00`;

        container.appendChild(div);
    }
}

document.getElementById("Session").addEventListener('change', (event) => {
    localStorage.setItem("session", document.getElementById("Session").value)
    renderSidebar();
    renderCalendar();
    renderTimeLabels();
  });


renderSidebar();
renderCalendar();
renderTimeLabels();