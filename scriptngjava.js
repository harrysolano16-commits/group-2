document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll(".nav-links a");
  
  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  });

  // Add task functionality
  const addTaskButton = document.querySelector("#todo button");
  const taskInput = document.querySelector("#todo input");
  
  if (addTaskButton && taskInput) {
    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addTask();
      }
    });
  }

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;
    
    const todoList = document.querySelector("#todo .todo");
    const newTask = document.createElement("li");
    
    newTask.innerHTML = `
      <div>
        <strong>${taskText}</strong>
        <div class="task-desc">New task</div>
      </div>
      <div class="badge">Due: Soon</div>
    `;
    
    todoList.appendChild(newTask);
    taskInput.value = "";
    
    // Add animation
    newTask.style.opacity = "0";
    setTimeout(() => {
      newTask.style.transition = "opacity 0.3s ease";
      newTask.style.opacity = "1";
    }, 10);
  }

  // Simple form validation for contact form
  const contactForm = document.querySelector(".contact-form");
  
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();
      
      if (name === "" || email === "" || message === "") {
        alert("Please fill in all fields before submitting.");
        return;
      }
      
      // In a real application, you would send this data to a server
      alert("Thank you for your message! We'll get back to you soon.");
      contactForm.reset();
    });
  }

  // Add active state to navigation based on scroll position
  const sections = document.querySelectorAll("section");
  
  function setActiveNavLink() {
    let current = "";
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollY >= sectionTop - 100) {
        current = section.getAttribute("id");
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("active");
      }
    });
  }
  
  // Add active state styling to CSS
  const style = document.createElement("style");
  style.textContent = `
    .nav-links a.active {
      color: var(--muted) !important;
      border-bottom: 2px solid var(--muted);
    }
  `;
  document.head.appendChild(style);
  
  // Set active nav link on scroll
  window.addEventListener("scroll", setActiveNavLink);
});