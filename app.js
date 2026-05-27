async function searchCourses() {
    const subject = document.getElementById("subject").value;
    const number = document.getElementById("number").value;
    const session = document.getElementById("Session").value;
    console.log(session)

    localStorage.setItem("lastSubject", subject);
    localStorage.setItem("lastNumber", number);
    localStorage.setItem("lastSession", session);

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "Loading...";

    try {
        const res = await fetch(
            `https://carleton-api.24radar.xyz/courses?subject=${subject}&number=${number}&session=${session}`
        );

        const data = await res.json();

        localStorage.setItem(
            "lastCourseResults",
            JSON.stringify(data)
        );

        renderCourses(data);

    } catch (err) {
        resultsDiv.innerHTML = "Error fetching data";
        console.error(err);
    }
}

/* store schedule */
function toggleCourse(course, btn) {
    let schedule = getSchedule();

    const index = schedule.findIndex(c => c.crn === course.crn);

    const isRemoving = index !== -1;

    if (isRemoving) {
        schedule.splice(index, 1);
    } else {
        schedule.push(course);
    }

    saveSchedule(schedule);

    // 🔥 ONLY update this button (no re-render)
    if (isRemoving) {
        btn.textContent = "Add to Schedule";
        btn.className = "add-button";
    } else {
        btn.textContent = "Remove";
        btn.className = "remove-button";
    }
}

function getSchedule() {
    return JSON.parse(localStorage.getItem("schedule")) || [];
}

function saveSchedule(schedule) {
    localStorage.setItem("schedule", JSON.stringify(schedule));
}

function isInSchedule(course) {
    const schedule = getSchedule();
    return schedule.some(c => c.crn === course.crn);
}

function renderCourses(data) {

    const resultsDiv =
        document.getElementById("results");

    resultsDiv.innerHTML = "";

    data.forEach(course => {

        const inSchedule = isInSchedule(course);

        const buttonLabel =
            inSchedule ? "Remove" : "Add to Schedule";

        const buttonClass =
            inSchedule ? "remove-button" : "add-button";

        const div = document.createElement("div");

        div.className = "course";

        div.innerHTML = `
            <div class="course-card">

                <div class="top-row">
                    <div>
                        <div class="course-title">
                            ${course.course} ${course.section}
                        </div>

                        <div class="course-subtitle">
                            ${course.title}
                        </div>
                    </div>

                    <div class="status ${course.status?.toLowerCase()}">
                        ${course.status}
                    </div>
                </div>

                <div class="grid-row">

                    <div class="info-grid">

                        <div class="block">
                            <div class="label">Instructor</div>
                            <div class="value">
                                ${course.instructor || "TBA"}
                            </div>
                        </div>

                        <div class="block">
                            <div class="label">Rating</div>
                            <div class="value rating">
                                ${course.rating ?? "N/A"}
                            </div>
                        </div>

                    </div>

                    <button
                        class="${buttonClass}"
                        onclick='toggleCourse(${JSON.stringify(course)}, this)'
                    >
                        ${buttonLabel}
                    </button>

                </div>

                <div class="schedule-row">

                    <div class="days">
                        ${course.days?.join(" • ") || "TBA"}
                    </div>

                    <div class="time">
                        ${course.start_time || "--"}
                        →
                        ${course.end_time || "--"}
                    </div>

                </div>

            </div>
        `;

        resultsDiv.appendChild(div);
    });
}

window.addEventListener("DOMContentLoaded", () => {

    const savedSubject =
        localStorage.getItem("lastSubject");

    const savedNumber =
        localStorage.getItem("lastNumber");

    const savedSession =
        localStorage.getItem("lastSession");

    const cachedResults =
        localStorage.getItem("lastCourseResults");

    if (savedSubject)
        document.getElementById("subject").value =
            savedSubject;

    if (savedNumber)
        document.getElementById("number").value =
            savedNumber;

    if (savedSession)
        document.getElementById("Session").value =
            savedSession;

    // 🔥 restore instantly WITHOUT API call
    if (cachedResults) {
        renderCourses(JSON.parse(cachedResults));
    }
});