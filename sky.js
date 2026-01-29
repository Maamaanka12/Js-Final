        // Page navigation
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            if (pageId === 'my-tickets') loadTickets();
        }

        // Random date/time generator (within next 30 days)
        function generateRandomFlightDateTime() {
            const now = new Date();
            const daysAhead = Math.floor(Math.random() * 30) + 1;
            const randomDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
            
            const hours = 8 + Math.floor(Math.random() * 12); // 8AM-8PM
            const minutes = Math.floor(Math.random() * 60);
            randomDate.setHours(hours, minutes, 0, 0);
            
            return randomDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        }

        // Ticket counter
        let ticketCounter = parseInt(localStorage.getItem('ticketCounter') || '0');

        // Class selection
        document.querySelectorAll('.class-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.class-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('flightClass').value = this.dataset.class;
            });
        });

        // Booking form
        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const departure = document.getElementById('departure').value;
            const destination = document.getElementById('destination').value;
            const flightClass = document.getElementById('flightClass').value;
            
            if (!fullName || !departure || !destination || !flightClass) {
                alert('Please fill all required fields and select a class');
                return;
            }

            // Generate random flight date/time
            const flightDateTime = generateRandomFlightDateTime();

            const ticket = {
                id: `TKT${++ticketCounter}`,
                fullName,
                departure,
                destination,
                flightDateTime,
                flightClass,
                bookingDate: new Date().toLocaleString()
            };

            // Save to localStorage
            let tickets = JSON.parse(localStorage.getItem('myTickets') || '[]');
            tickets.push(ticket);
            localStorage.setItem('myTickets', JSON.stringify(tickets));
            localStorage.setItem('ticketCounter', ticketCounter);

            // Success message
            const successMsg = document.getElementById('successMessage');
            successMsg.innerHTML = `
                <strong>🎉 Booking Confirmed!</strong><br>
                Ticket <strong>${ticket.id}</strong> created successfully.<br>
                Flight: ${ticket.departure} → ${ticket.destination}<br>
                <em>Redirecting to My Tickets...</em>
            `;
            successMsg.style.display = 'block';

            // Reset form
            this.reset();
            document.querySelectorAll('.class-option').forEach(opt => opt.classList.remove('selected'));

            // Redirect
            setTimeout(() => showPage('my-tickets'), 2500);
        });

        // Load tickets
        function loadTickets() {
            const tickets = JSON.parse(localStorage.getItem('myTickets') || '[]');
            const container = document.getElementById('ticketsContainer');
            
            if (tickets.length === 0) {
                container.innerHTML = `
                    <div class="no-tickets">
                        No tickets booked yet. <a href="#" onclick="showPage('tickets')" class="btn" style="display: inline-flex; margin-top: 1rem;">Book Your First Flight</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = tickets.map(ticket => {
                const [date, time] = ticket.flightDateTime.split('T');
                return `
                    <div class="ticket-card">
                        <div class="ticket-id">${ticket.id}</div>
                        <h3>${ticket.fullName}</h3>
                        <div class="route">${ticket.departure} → ${ticket.destination}</div>
                        <div class="class-badge class-${ticket.flightClass.toLowerCase()}">${ticket.flightClass}</div>
                        <div class="details">
                            <div><strong>Date:</strong> ${date}</div>
                            <div><strong>Time:</strong> ${time}</div>
                            <div><strong>Booked:</strong> ${ticket.bookingDate}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Set min date if needed (for future enhancements)
        document.getElementById('flightDate')?.setAttribute('min', new Date().toISOString().split('T')[0]);