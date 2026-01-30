// --- Navigation Logic ---
        function navigateTo(pageId) {
            // Hide all pages
            document.getElementById('home-page').classList.add('hidden');
            document.getElementById('book-page').classList.add('hidden');
            document.getElementById('my-tickets-page').classList.add('hidden');
            
            // Show selected page
            const target = document.getElementById(pageId + '-page');
            target.classList.remove('hidden');
            
            // Scroll to top
            window.scrollTo(0, 0);

            // Close mobile menu if open
            document.getElementById('mobile-menu').classList.add('hidden');

            // If navigating to my-tickets, render them
            if (pageId === 'my-tickets') {
                renderTickets();
            }
        }

        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        // --- Data & Booking Logic ---

        // Helper to get tickets from Local Storage
        function getStoredTickets() {
            const tickets = localStorage.getItem('skybound_tickets');
            return tickets ? JSON.parse(tickets) : [];
        }

        // Handle Form Submission
        function handleBooking(event) {
            event.preventDefault();

            // 1. Collect Data
            const fullName = document.getElementById('fullName').value;
            const from = document.getElementById('fromAirport').value;
            const to = document.getElementById('toAirport').value;
            const date = document.getElementById('flightDate').value;
            const time = document.getElementById('flightTime').value;

            // 2. Generate Random Data (Flight # and Status)
            const flightNum = 'SB-' + Math.floor(1000 + Math.random() * 9000); // e.g., SB-4521
            
            const statuses = ['Available', 'Available', 'Available', 'Redirected', 'Maintenance']; // Weighted towards Available
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            const ticketId = Date.now().toString(); // Unique ID based on timestamp

            // 3. Create Ticket Object
            const newTicket = {
                id: ticketId,
                passenger: fullName,
                from: from,
                to: to,
                date: date,
                time: time,
                flightNumber: flightNum,
                status: status,
                bookedAt: new Date().toLocaleString()
            };

            // 4. Save to Local Storage
            const tickets = getStoredTickets();
            tickets.unshift(newTicket); // Add to beginning of array
            localStorage.setItem('skybound_tickets', JSON.stringify(tickets));

            // 5. Reset Form
            document.getElementById('bookingForm').reset();

            // 6. Show Success & Redirect
            // Using a simple alert for this demo, could be a modal
            alert(`Booking Confirmed!\nFlight: ${flightNum}\nStatus: ${status}`);
            navigateTo('my-tickets');
        }

        // --- Rendering Logic ---

        function renderTickets() {
            const tickets = getStoredTickets();
            const container = document.getElementById('tickets-container');
            const noTicketsMsg = document.getElementById('no-tickets-msg');
            const clearBtn = document.getElementById('clearBtn');

            container.innerHTML = ''; // Clear current display

            if (tickets.length === 0) {
                noTicketsMsg.classList.remove('hidden');
                clearBtn.classList.add('hidden');
                return;
            }

            noTicketsMsg.classList.add('hidden');
            clearBtn.classList.remove('hidden');

            tickets.forEach(ticket => {
                // Determine styling based on status
                let statusColorClass = '';
                let statusIcon = '';
                let bgGradient = '';

                if (ticket.status === 'Available') {
                    statusColorClass = 'text-green-600 bg-green-100';
                    statusIcon = 'fa-circle-check';
                    bgGradient = 'from-blue-500 to-blue-700'; // Standard Blue
                } else if (ticket.status === 'Redirected') {
                    statusColorClass = 'text-orange-600 bg-orange-100';
                    statusIcon = 'fa-plane-slash';
                    bgGradient = 'from-orange-400 to-orange-600'; // Warning Orange
                } else {
                    statusColorClass = 'text-red-600 bg-red-100';
                    statusIcon = 'fa-screwdriver-wrench';
                    bgGradient = 'from-gray-500 to-gray-700'; // Maintenance Gray
                }

                // Format Date nicely
                const dateObj = new Date(ticket.date);
                const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                const cardHTML = `
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                    <!-- Ticket Header -->
                    <div class="bg-gradient-to-r ${bgGradient} p-4 text-white flex justify-between items-center relative ticket-cutout">
                        <div class="flex items-center space-x-2 z-10">
                            <i class="fa-solid fa-plane-up"></i>
                            <span class="font-bold tracking-wider text-lg">${ticket.flightNumber}</span>
                        </div>
                        <div class="text-right z-10">
                            <div class="text-xs opacity-80">Class</div>
                            <div class="font-bold">Economy</div>
                        </div>
                    </div>
                    
                    <!-- Ticket Body -->
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-6">
                            <div class="text-center w-1/3">
                                <div class="text-3xl font-bold text-gray-800">${ticket.from}</div>
                                <div class="text-xs text-gray-500 uppercase tracking-wide">Departure</div>
                            </div>
                            <div class="w-1/3 text-center px-2">
                                <div class="border-t-2 border-dashed border-gray-300 relative top-3"></div>
                                <i class="fa-solid fa-plane text-blue-300 relative bg-white px-2"></i>
                                <div class="text-xs text-gray-400 mt-1">${ticket.time}</div>
                            </div>
                            <div class="text-center w-1/3">
                                <div class="text-3xl font-bold text-gray-800">${ticket.to}</div>
                                <div class="text-xs text-gray-500 uppercase tracking-wide">Arrival</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                            <div>
                                <div class="text-xs text-gray-400">Passenger</div>
                                <div class="font-semibold text-gray-700 truncate">${ticket.passenger}</div>
                            </div>
                            <div>
                                <div class="text-xs text-gray-400">Date</div>
                                <div class="font-semibold text-gray-700">${dateStr}</div>
                            </div>
                        </div>

                        <div class="mt-4 flex justify-between items-center">
                            <div class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${statusColorClass}">
                                <i class="fa-solid ${statusIcon}"></i>
                                ${ticket.status.toUpperCase()}
                            </div>
                            <button onclick="deleteTicket('${ticket.id}')" class="text-gray-400 hover:text-red-500 transition" title="Remove Ticket">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
                container.innerHTML += cardHTML;
            });
        }

        // Delete a specific ticket
        function deleteTicket(id) {
            if(!confirm("Remove this ticket from your history?")) return;
            
            let tickets = getStoredTickets();
            tickets = tickets.filter(t => t.id !== id);
            localStorage.setItem('skybound_tickets', JSON.stringify(tickets));
            renderTickets();
        }

        // Clear all tickets
        function clearAllTickets() {
            if(!confirm("Are you sure you want to delete ALL booking history?")) return;
            localStorage.removeItem('skybound_tickets');
            renderTickets();
        }

        // Set default date to today in the form
        document.getElementById('flightDate').valueAsDate = new Date();