let role = ""; // admin or user

function selectRole(selectedRole) {
  role = selectedRole;
  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("choose-action").classList.remove("hidden");
  document.getElementById("role-title").innerText = `You selected: ${role.toUpperCase()}. Choose an action`;
}

function showForm(action) {
  document.getElementById("choose-action").classList.add("hidden");

  if (action === 'register') {
    document.getElementById("register-form").classList.remove("hidden");
    document.getElementById("register-title").innerText = role === "admin" ? "Admin Register" : "User Register";
  } else if (action === 'login') {
    document.getElementById("login-form").classList.remove("hidden");
    document.getElementById("login-title").innerText = role === "admin" ? "Admin Login" : "User Login";
  }
}

function backToMain() {
  document.getElementById("main-screen").classList.remove("hidden");
  document.getElementById("choose-action").classList.add("hidden");
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("message").classList.add("hidden");
  document.getElementById("user-list").classList.add("hidden");
  clearInputs();
  role = "";
}

function clearInputs() {
  document.getElementById("fullName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
}

async function register() {
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!fullName || !email || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/register-${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message || "Registration failed.");
    } else {
      alert(data.message);
      document.getElementById("register-form").classList.add("hidden");
      document.getElementById("login-form").classList.remove("hidden");
      document.getElementById("login-title").innerText = role === "admin" ? "Admin Login" : "User Login";
      clearInputs();
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong during registration.");
  }
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
  
    if (!email || !password) {
      alert("Please fill all fields!");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8000/login-${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Login failed.");
        return;
      }
  
      if (role === "admin") {
        localStorage.setItem("token", data.accessToken);
        fetchAllUsers();
      } else {
        document.getElementById("login-form").classList.add("hidden");
        document.getElementById("message").classList.remove("hidden");
        // Show welcome message with user's name
        document.getElementById("message-text").innerHTML = `
          Welcome, <strong>${data.user.fullName}</strong>!<br>
          You have successfully logged in.
        `;
        clearInputs();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during login.");
    }
  }

  async function fetchAllUsers() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Access Denied. No Token Provided.");
        backToMain();
        return;
      }
  
      const response = await fetch("http://localhost:8000/all-users", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to fetch users.");
        backToMain();
      } else {
        showUsers(data.users);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch users.");
      backToMain();
    }
  }

function showUsers(users) {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("user-list").classList.remove("hidden");

  const userListDiv = document.getElementById("users-container");
  userListDiv.innerHTML = "";

  users.forEach(user => {
    const userCard = document.createElement("div");
    userCard.classList.add("user-card");
    userCard.innerHTML = `
      <h3>${user.fullName}</h3>
      <p>Email: ${user.email}</p>
      <p>Joined On: ${new Date(user.createdOn).toLocaleDateString()}</p>
    `;
    userListDiv.appendChild(userCard);
  });
}
