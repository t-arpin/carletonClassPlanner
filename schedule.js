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
                <b>${course.course}</b><br>
                ${course.section}
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
    return JSON.parse(localStorage.getItem("schedule")) || [];
}

function saveSchedule(data) {
    localStorage.setItem("schedule", JSON.stringify(data));
}

function renderSidebar() {
    const container = document.getElementById("courseList");
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

renderSidebar();
renderCalendar();
renderTimeLabels();