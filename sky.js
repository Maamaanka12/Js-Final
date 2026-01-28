        // DOM Elements
        const homePage = document.getElementById('home-page');
        const bookPage = document.getElementById('book-page');
        const ticketsPage = document.getElementById('tickets-page');
        const ticketsList = document.getElementById('tickets-list');
        const ticketCount = document.getElementById('ticket-count');
        const bookingForm = document.getElementById('booking-form');
        const messageContainer = document.getElementById('message-container');
        
        // Navigation Elements
        const navHome = document.getElementById('nav-home');
        const navBook = document.getElementById('nav-book');
        const navTickets = document.getElementById('nav-tickets');
        const heroBookBtn = document.getElementById('hero-book-btn');
        const heroTicketsBtn = document.getElementById('hero-tickets-btn');
        const footerNavHome = document.querySelector('.footer-nav-home');
        const footerNavBook = document.querySelector('.footer-nav-book');
        const footerNavTickets = document.querySelector('.footer-nav-tickets');
        
        // Initialize Local Storage for tickets if not exists
        if (!localStorage.getItem('travelTickets')) {
            localStorage.setItem('travelTickets', JSON.stringify([]));
        }
        
        // Set minimum date to today for flight date input
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('flight-date').min = today;
        
        // Navigation Functions
        function showPage(pageId) {
            // Hide all pages
            homePage.style.display = 'none';
            bookPage.style.display = 'none';
            ticketsPage.style.display = 'none';
            
            // Remove active class from all nav links
            document.querySelectorAll('nav a').forEach(link => {
                link.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId).style.display = 'block';
            
            // Update active nav link
            if (pageId === 'home-page') {
                navHome.classList.add('active');
            } else if (pageId === 'book-page') {
                navBook.classList.add('active');
            } else if (pageId === 'tickets-page') {
                navTickets.classList.add('active');
                loadTickets(); // Load tickets when page is shown
            }
        }
        
        // Navigation Event Listeners
        navHome.addEventListener('click', () => showPage('home-page'));
        navBook.addEventListener('click', () => showPage('book-page'));
        navTickets.addEventListener('click', () => showPage('tickets-page'));
        heroBookBtn.addEventListener('click', () => showPage('book-page'));
        heroTicketsBtn.addEventListener('click', () => showPage('tickets-page'));
        footerNavHome.addEventListener('click', () => showPage('home-page'));
        footerNavBook.addEventListener('click', () => showPage('book-page'));
        footerNavTickets.addEventListener('click', () => showPage('tickets-page'));
        
        // Show message function
        function showMessage(text, type = 'success') {
            const message = document.createElement('div');
            message.className = `message message-${type}`;
            message.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${text}</span>
            `;
            
            messageContainer.appendChild(message);
            
            // Trigger animation
            setTimeout(() => {
                message.classList.add('show');
            }, 10);
            
            // Remove message after 5 seconds
            setTimeout(() => {
                message.classList.remove('show');
                setTimeout(() => {
                    message.remove();
                }, 500);
            }, 5000);
        }
        
        // Generate random flight status
        function getRandomStatus() {
            const statuses = ['Available', 'Redirected to another airport', 'Under maintenance'];
            const weights = [70, 20, 10]; // 70% Available, 20% Redirected, 10% Maintenance
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < statuses.length; i++) {
                if (random < weights[i]) {
                    return statuses[i];
                }
                random -= weights[i];
            }
            
            return statuses[0]; // Default to Available
        }
        
        // Generate flight number if not provided
        function generateFlightNumber() {
            const airlines = ['SK', 'AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK'];
            const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
            const randomNumber = Math.floor(Math.random() * 900) + 100;
            return `${randomAirline}${randomNumber}`;
        }
        
        // Generate a unique ticket ID
        function generateTicketId() {
            return 'TKT' + Date.now() + Math.floor(Math.random() * 1000);
        }
        
        // Get status badge class based on status
        function getStatusClass(status) {
            if (status === 'Available') return 'status-available';
            if (status === 'Redirected to another airport') return 'status-redirected';
            if (status === 'Under maintenance') return 'status-maintenance';
            return '';
        }
        
        // Format date for display
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        
        // Format time for display
        function formatTime(timeString) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }
        
        // Book ticket form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = document.getElementById('full-name').value;
            const departureAirport = document.getElementById('departure-airport').value;
            const destinationAirport = document.getElementById('destination-airport').value;
            const flightDate = document.getElementById('flight-date').value;
            const flightTime = document.getElementById('flight-time').value;
            let flightNumber = document.getElementById('flight-number').value;
            
            // Generate flight number if empty
            if (!flightNumber.trim()) {
                flightNumber = generateFlightNumber();
            }
            
            // Generate ticket ID and status
            const ticketId = generateTicketId();
            const status = getRandomStatus();
            const bookingDate = new Date().toISOString();
            
            // Create ticket object
            const ticket = {
                id: ticketId,
                passengerName: fullName,
                departureAirport: departureAirport,
                departureAirportName: document.getElementById('departure-airport').selectedOptions[0].text,
                destinationAirport: destinationAirport,
                destinationAirportName: document.getElementById('destination-airport').selectedOptions[0].text,
                flightDate: flightDate,
                flightTime: flightTime,
                flightNumber: flightNumber,
                status: status,
                bookingDate: bookingDate
            };
            
            // Get existing tickets from localStorage
            const tickets = JSON.parse(localStorage.getItem('travelTickets'));
            
            // Add new ticket
            tickets.push(ticket);
            
            // Save back to localStorage
            localStorage.setItem('travelTickets', JSON.stringify(tickets));
            
            // Show success message
            showMessage(`Ticket booked successfully! Your flight number is ${flightNumber}.`, 'success');
            
            // Reset form
            bookingForm.reset();
            
            // Set minimum date to today
            document.getElementById('flight-date').min = today;
            
            // Redirect to My Tickets page after 2 seconds
            setTimeout(() => {
                showPage('tickets-page');
            }, 2000);
        });
        
        // Load and display tickets
        function loadTickets() {
            // Clear current tickets display
            ticketsList.innerHTML = '';
            
            // Get tickets from localStorage
            const tickets = JSON.parse(localStorage.getItem('travelTickets'));
            
            // Update ticket count
            ticketCount.textContent = tickets.length;
            
            // If no tickets, show message
            if (tickets.length === 0) {
                ticketsList.innerHTML = `
                    <div class="no-tickets">
                        <i class="fas fa-ticket-alt"></i>
                        <h3>You have no booked tickets yet.</h3>
                        <p>Book your first travel ticket to get started!</p>
                        <a href="#" class="btn" id="no-tickets-book-btn" style="margin-top: 20px;">Book a Ticket</a>
                    </div>
                `;
                
                // Add event listener to the button
                document.getElementById('no-tickets-book-btn').addEventListener('click', () => {
                    showPage('book-page');
                });
                
                return;
            }
            
            // Create tickets grid
            const ticketsGrid = document.createElement('div');
            ticketsGrid.className = 'tickets-grid';
            
            // Sort tickets by booking date (newest first)
            tickets.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
            
            // Create ticket card for each ticket
            tickets.forEach(ticket => {
                const ticketCard = document.createElement('div');
                ticketCard.className = 'ticket-card';
                
                const statusClass = getStatusClass(ticket.status);
                const formattedDate = formatDate(ticket.flightDate);
                const formattedTime = formatTime(ticket.flightTime);
                const bookingDateFormatted = formatDate(ticket.bookingDate);
                
                ticketCard.innerHTML = `
                    <div class="ticket-header">
                        <div class="ticket-id">${ticket.id}</div>
                        <div class="flight-number">${ticket.flightNumber}</div>
                    </div>
                    <div class="ticket-body">
                        <div class="passenger-name">${ticket.passengerName}</div>
                        
                        <div class="route">
                            <div class="airport">
                                <div class="airport-code">${ticket.departureAirport}</div>
                                <div class="airport-name">${ticket.departureAirportName.split(' - ')[1]}</div>
                            </div>
                            <div class="route-arrow">
                                <i class="fas fa-long-arrow-alt-right"></i>
                            </div>
                            <div class="airport">
                                <div class="airport-code">${ticket.destinationAirport}</div>
                                <div class="airport-name">${ticket.destinationAirportName.split(' - ')[1]}</div>
                            </div>
                        </div>
                        
                        <div class="flight-details">
                            <div class="detail-item">
                                <i class="fas fa-calendar-alt"></i>
                                <div>
                                    <div class="detail-label">Date</div>
                                    <div class="detail-value">${formattedDate}</div>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <div class="detail-label">Time</div>
                                    <div class="detail-value">${formattedTime}</div>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-suitcase"></i>
                                <div>
                                    <div class="detail-label">Booking Date</div>
                                    <div class="detail-value">${bookingDateFormatted}</div>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-info-circle"></i>
                                <div>
                                    <div class="detail-label">Status</div>
                                    <div class="status-badge ${statusClass}">${ticket.status}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                ticketsGrid.appendChild(ticketCard);
            });
            
            ticketsList.appendChild(ticketsGrid);
        }
        
        // Initialize the app
        function initApp() {
            // Show home page by default
            showPage('home-page');
            
            // Load tickets if on tickets page (handled by showPage function)
        }
        
        // Start the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', initApp);