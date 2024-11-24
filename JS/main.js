const baseUrl = "http://localhost:5000/api"; // development
// const baseUrl = "https://taskmaster-backend.fly.dev/api"; // production

const dialog = document.getElementById("dialog");
const createButton = document.getElementById("createButton");
const closeButton = document.getElementById("closeBtn");
const tasksContainer = document.getElementById("tasksContainer");
const token = localStorage.getItem("token");

async function handleSignup(event) {
  event.preventDefault();
  const data = {};
  for (const [key, value] of new FormData(
    document.getElementById("form")
  ).entries()) {
    data[key] = value;
  }
  try {
    const res = await (
      await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();

    if (res?.token) {
      window.alert("Account creation successful!");
      localStorage.setItem("token", res.token);
      window.location.href = "login.html";
    } else {
      window.alert("Account creation failed");
    }
  } catch (error) {
    window.alert("Account creation failed");
    console.log("error: ", error);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const data = {};
  for (const [key, value] of new FormData(
    document.getElementById("form")
  ).entries()) {
    data[key] = value;
  }
  try {
    const res = await (
      await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();

    if (res?.token) {
      window.alert("Login successful!");
      localStorage.setItem("token", res.token);
      window.location.href = "dashboard.html";
    } else {
      window.alert("Login failed");
    }
  } catch (error) {
    window.alert("Login failed");
    console.log("error: ", error);
  }
}

async function createTask(event) {
  event.preventDefault();
  const data = {};
  for (const [key, value] of new FormData(
    document.getElementById("form")
  ).entries()) {
    data[key] = value;
  }
  if (!token) return;

  try {
    const res = await (
      await fetch(`${baseUrl}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
    ).json();
    console.log("res: ", res);
    if (res?._id) {
      window.alert("Task created successfully");
      dialog.close();
    } else {
      window.alert("Task creation failed");
    }
  } catch (error) {
    window.alert("Task creation failed");
    console.log("error: ", error);
  }
}

if (createButton) {
  createButton.addEventListener("click", () => {
    dialog.showModal();
  });
}

if (closeButton) {
  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    dialog.close();
  });
}

const handleTaskAction = async (event) => {
  const targetButton = event.target;

  if (
    !targetButton.classList.contains("editBtn") &&
    !targetButton.classList.contains("deleteBtn")
  ) {
    return;
  }

  if (!token) return;

  const taskElement = targetButton.closest(".task");
  const taskId = taskElement.querySelector(".hidden").textContent;

  if (targetButton.classList.contains("editBtn")) {
    editTask(taskElement.querySelector(".details"));
  } else if (targetButton.classList.contains("deleteBtn")) {
    deleteTask(taskId);
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  const res = await displayTasks();

  // search
  document.getElementById("search").addEventListener("input", (event) => {
    let searchTerm = event.target.value;
    const filteredTasks = filterTasks(searchTerm, res);
    tasksContainer.innerHTML = `
            ${filteredTasks
              .map(
                ({ _id, deadline, description, priority, title }) => `
                  <div class="task" data-id="${_id}">
                   <div class="details">
                      <p id="deadline"><strong>Deadline:</strong> ${new Date(
                        deadline
                      ).toDateString()}</p>
                      <p id="description"><strong>Description:</strong> ${description}</p>
                      <p id="priority"><strong>Priority:</strong> ${priority}</p>
                      <p id="title"><strong>Title:</strong> ${title}</p>
                      <p class="hidden">${_id}</p>
                    </div>
                   <div class="actions">
                      <p class="editBtn">Edit</p>
                      <p class="deleteBtn">Delete</p>
                   </div>
                  </div>
                `
              )
              .join("")}
          `;
  });

  tasksContainer.addEventListener("click", handleTaskAction);
});

async function displayTasks() {
  if (!token) return;

  try {
    const res = await (
      await fetch(`${baseUrl}/tasks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    ).json();
    if (res?.length) {
      tasksContainer.innerHTML = `
            ${res
              .map(
                ({ _id, deadline, description, priority, title }) => `
                  <div class="task" data-id="${_id}">
                   <div class="details">
                      <p id="deadline"><strong>Deadline:</strong> ${new Date(
                        deadline
                      ).toDateString()}</p>
                      <p id="description"><strong>Description:</strong> ${description}</p>
                      <p id="priority"><strong>Priority:</strong> ${priority}</p>
                      <p id="title"><strong>Title:</strong> ${title}</p>
                      <p class="hidden">${_id}</p>
                    </div>
                   <div class="actions">
                      <p class="editBtn">Edit</p>
                      <p class="deleteBtn">Delete</p>
                   </div>
                  </div>
                `
              )
              .join("")}
          `;
    }
    return res;
  } catch (error) {
    console.log("error: ", error);
  }
}

// helper function fo filtering
const filterTasks = (searchTerm, tasks) =>
  tasks?.filter(({ description, title, priority }) => {
    let rgx = new RegExp(`^${searchTerm}`, "ig");
    return description.match(rgx) || title.match(rgx) || priority.match(rgx);
  });

async function editTask(taskContainer) {
  const taskId = taskContainer.querySelector(".hidden").innerText;
  console.log("taskId: ", taskId);
  // Extract current task details
  const title = taskContainer
    .querySelector("#title")
    .innerText.replace("Deadline: ", "");
  const deadline = taskContainer
    .querySelector("#deadline")
    .innerText.replace("Deadline: ", "");
  const description = taskContainer
    .querySelector("#description")
    .innerText.replace("Description: ", "");
  const priority = taskContainer
    .querySelector("#priority")
    .innerText.replace("Priority: ", "");

  // Create a dialog element with a form
  const dialog = document.createElement("dialog");

  dialog.innerHTML = `
        <form onsubmit="updateTask(event)" id="edit-form">
          <section class="input-container">
            <label for="title">Title</label>
            <input
              required
              type="text"
              name="title"
              placeholder="Title"
              id="title"
              value="${title}"
            />
          </section>
          <section class="input-container">
            <label for="description">Description</label>
            <input
              required
              type="description"
              name="description"
              placeholder="Description"
              id="description"
              value="${description}"
            />
          </section>
          <section class="input-container">
            <label for="deadline">Deadline</label>
            <input required type="date" name="deadline" id="deadline" value="${new Date(
              deadline
            )
              .toISOString()
              .slice(0, 10)}"/>
          </section>
    
          <section class="input-container">
            <label for="priority">Priority</label>
            <select name="priority" id="priority">
              <option value="low" ${
                priority === "low" ? "selected" : ""
              }>Low</option>
              <option value="medium" ${
                priority === "medium" ? "selected" : ""
              }>Medium</option>
              <option value="high" ${
                priority === "high" ? "selected" : ""
              }>High</option>
            </select>
          </section>
  
          <div class="button-group">
            <button autofocus id="closeBtn">Close</button>
            <button id="" type="submit">Update</button>
          </div>
        </form>
  `;

  // Add dialog to the document
  document.querySelector("body > main").appendChild(dialog);

  // Open dialog
  dialog.showModal();

  // Handle form submission
  const form = dialog.querySelector("#edit-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const updatedTask = {
      title: formData.get("title"),
      deadline: formData.get("deadline"),
      description: formData.get("description"),
      priority: formData.get("priority"),
    };
    if (!token) return;
    try {
      const res = await (
        await fetch(`${baseUrl}/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTask),
        })
      ).json();
      console.log("res: ", res);
      if (res?._id) {
        window.alert("Task updated successfully");
        dialog.close();
        window.location.reload();
      } else {
        window.alert("Task update failed");
      }
    } catch (error) {
      window.alert("Task update failed");
      console.log("error: ", error);
    }
  });

  document.getElementById("closeBtn").addEventListener("click", () => {
    dialog.close();
    dialog.remove();
  });
}

async function deleteTask(id) {
  try {
    const res = await (
      await fetch(`${baseUrl}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    ).json();

    if (res?.message == "Task deleted") {
      window.alert("Deleted successfully.");
      window.location.reload();
    }
  } catch (error) {
    console.log("error: ", error);
  }
}

// "get started" button on landing page
document.getElementById("startBtn").addEventListener("click", () => {
  if (token) {
    window.location.href = "dashboard.html";
  } else {
    window.location.href = "login.html";
  }
});
