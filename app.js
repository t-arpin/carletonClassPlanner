async function searchCourses() {
    const subject = document.getElementById("subject").value;
    const number = document.getElementById("number").value;
    const session = document.getElementById("Session").value;
    console.log(session)

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "Loading...";

    try {
        const res = await fetch(
            `https://carleton-api.24radar.xyz/courses?subject=${subject}&number=${number}&session=${session}`
        );

        const data = await res.json();

        resultsDiv.innerHTML = "";

        data.forEach(course => {
            const div = document.createElement("div");
            div.className = "course";

            const inSchedule = isInSchedule(course);
            const buttonLabel = inSchedule ? "Remove" : "Add to Schedule";
            const buttonClass = inSchedule ? "remove-button" : "add-button";

            div.innerHTML = `
                <div class="course-card">

                    <!-- TOP ROW: Title + status -->
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

                    <!-- MIDDLE ROW: key facts -->
                    <div class="grid-row">
                        <div class="info-grid">
                            <div class="block">
                                <div class="label">CRN</div>
                                <div class="value">${course.crn}</div>
                            </div>

                            <div class="block">
                                <div class="label">Instructor</div>
                                <div class="value">${course.instructor || "TBA"}</div>
                            </div>

                            <div class="block">
                                <div class="label">Rating</div>
                                <div class="value rating">${course.rating ?? "N/A"}</div>
                            </div>

                            <div class="block">
                                <div class="label">Credits</div>
                                <div class="value">${course.credits}</div>
                            </div>

                            <div class="block">
                                <div class="label">Type</div>
                                <div class="value">${course.schedule_type}</div>
                            </div>
                        </div>

                        <button 
                            class="class-button ${buttonClass}" 
                            onclick='toggleCourse(${JSON.stringify(course)}, this)'
                        >
                            ${buttonLabel}
                        </button>

                    </div>

                    <!-- SCHEDULE ROW -->
                    <div class="schedule-row">
                        <div class="days">
                            ${course.days?.join(" • ") || "TBA"}
                        </div>

                        <div class="time">
                            ${course.start_time || "--"} → ${course.end_time || "--"}
                        </div>

                        <div class="location">
                            ${course.building || ""} ${course.room || ""}
                        </div>
                    </div>

                    <!-- OPTIONAL INFO (collapsed) -->
                    <details>
                        <summary>More Info</summary>

                        <div class="extra-grid">
                            <div><b>Prereqs:</b> ${course.prereqs_required}</div>
                            <div><b>Restrictions:</b> ${course.restrictions}</div>
                            <div><b>Also in:</b> ${course.also_register_in || "None"}</div>
                        </div>

                        <p class="section-info">
                            ${course.section_information || "No extra information"}
                        </p>
                    </details>

                </div>
                `;

            resultsDiv.appendChild(div);
        });

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