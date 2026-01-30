 // --- Navigation Logic ---
        
        // Function to switch between different "pages" (sections)
        function navigateTo(pageId) {
            // 1. Get references to all main page sections
            const home = document.getElementById('home-page');
            const book = document.getElementById('book-page');
            const myTickets = document.getElementById('my-tickets-page');
            const about = document.getElementById('about-page');
            
            // 2. Hide all pages by adding the 'hidden' class (Tailwind utility)
            home.classList.add('hidden');
            book.classList.add('hidden');
            myTickets.classList.add('hidden');
            about.classList.add('hidden');
            
            // 3. Select the specific page user wants to see
            const target = document.getElementById(pageId + '-page');
            // 4. Show it by removing 'hidden' class
            target.classList.remove('hidden');
            
            // 5. Scroll to the top of the window for a fresh view
            window.scrollTo(0, 0);

            // 6. Close the mobile menu if it was open (for better UX)
            document.getElementById('mobile-menu').classList.add('hidden');

            // 7. Special Check: If going to "My Tickets", we must refresh the list
            // to show any new bookings or update expiration status.
            if (pageId === 'my-tickets') {
                renderTickets();
            }
        }

        // Function to open/close the hamburger menu on mobile
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            // Toggles the 'hidden' class on/off
            menu.classList.toggle('hidden');
        }

        // --- Date Configuration & Validation Init ---

        // This runs immediately when the script loads to set up date constraints
        (function setupDateConstraints() {
            // 1. Get the Date input element
            const dateInput = document.getElementById('flightDate');
            // 2. Create a new Date object for right now
            const today = new Date();
            // 3. Format it as YYYY-MM-DD for the HTML 'min' attribute
            // isoString looks like "2023-10-25T14:00...", splitting at 'T' gives us just the date part
            const minDate = today.toISOString().split('T')[0];
            // 4. Set the attribute so users cannot pick past dates in the calendar picker
            dateInput.setAttribute('min', minDate);

            // 5. Add an event listener to check time when date changes
            dateInput.addEventListener('change', function() {
                validateTimeConstraint();
            });

            // 6. Add event listener to time input as well
            document.getElementById('flightTime').addEventListener('change', function() {
                validateTimeConstraint();
            });
        })();

        // Function to ensure time is not in the past if "Today" is selected
        function validateTimeConstraint() {
            // 1. Get input values
            const dateInput = document.getElementById('flightDate');
            const timeInput = document.getElementById('flightTime');
            
            // 2. If no date is picked yet, stop
            if (!dateInput.value) return;

            // 3. Create Date objects for "Selected Date" and "Now"
            const selectedDate = new Date(dateInput.value);
            const now = new Date();
            
            // 4. Check if the selected day is effectively "Today"
            // We compare date strings to ignore exact millisecond differences
            const isToday = selectedDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];

            if (isToday) {
                // 5. If it is today, calculate current time in HH:MM format
                const nowHours = String(now.getHours()).padStart(2, '0');
                const nowMinutes = String(now.getMinutes()).padStart(2, '0');
                const currentTime = `${nowHours}:${nowMinutes}`;

                // 6. Set the minimum time allowed on the input
                timeInput.min = currentTime;

                // 7. If user already picked a time and it is less than current time, reset it
                if (timeInput.value && timeInput.value < currentTime) {
                    alert("You cannot book a flight in the past! Please select a future time.");
                    timeInput.value = ""; // Clear the invalid time
                }
            } else {
                // 8. If date is in the future, remove the time restriction
                timeInput.removeAttribute('min');
            }
        }

        // --- Data Handling & Booking Logic ---

        // Helper function to retrieve ticket array from browser Local Storage
        function getStoredTickets() {
            // 1. Get the string data from storage
            const tickets = localStorage.getItem('skybound_tickets');
            // 2. Parse it into JSON, or return an empty array if nothing exists
            return tickets ? JSON.parse(tickets) : [];
        }

        // Main function to handle the form submission (Booking)
        function handleBooking(event) {
            // 1. Prevent the page from refreshing (default form behavior)
            event.preventDefault();

            // --- Robust JS Validation Layer ---
            
            // 2. Get all input values
            const fullName = document.getElementById('fullName').value;
            const from = document.getElementById('fromAirport').value;
            const to = document.getElementById('toAirport').value;
            const dateVal = document.getElementById('flightDate').value;
            const timeVal = document.getElementById('flightTime').value;
            const flightClass = document.getElementById('flightClass').value; // Get chosen class

            // 3. Create Date objects to compare strictly
            // combine date and time string to make a full Date object
            const bookingDateTime = new Date(`${dateVal}T${timeVal}`);
            const now = new Date();

            // 4. Check if booking is in the past (Safety check)
            if (bookingDateTime < now) {
                alert("Error: Cannot book a flight in the past. Please check date and time.");
                return; // Stop execution
            }

            // --- Logic for Ticket Creation ---

            // 5. Generate a random flight number (e.g., SB-4521)
            const flightNum = 'SB-' + Math.floor(1000 + Math.random() * 9000); 
            
            // 6. Create unique ID based on current timestamp
            const ticketId = Date.now().toString(); 

            // 7. Calculate Expiration Date (7 days from NOW)
            // 7 days * 24 hours * 60 min * 60 sec * 1000 ms
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            const expiryDate = new Date(now.getTime() + sevenDaysInMs).toISOString();

            // 8. Construct the Ticket Object
            const newTicket = {
                id: ticketId,
                passenger: fullName,
                classType: flightClass, // Store the selected class
                from: from,
                to: to,
                date: dateVal,
                time: timeVal,
                flightNumber: flightNum,
                bookedAt: now.toISOString(),
                expiresAt: expiryDate // Store when it expires
            };

            // 9. Get existing tickets, add new one to the TOP of the list
            const tickets = getStoredTickets();
            tickets.unshift(newTicket); 
            
            // 10. Save back to Local Storage
            localStorage.setItem('skybound_tickets', JSON.stringify(tickets));

            // 11. Reset the form for next use
            document.getElementById('bookingForm').reset();
            // Reset date constraint logic
            document.getElementById('flightDate').valueAsDate = new Date();

            // 12. Notify user and redirect
            alert(`Booking Confirmed!\nFlight: ${flightNum}\nClass: ${flightClass}\nValid for 7 Days.`);
            navigateTo('my-tickets');
        }

        // --- Rendering Logic (Displaying Tickets) ---

        function renderTickets() {
            // 1. Fetch data
            const tickets = getStoredTickets();
            const container = document.getElementById('tickets-container');
            const noTicketsMsg = document.getElementById('no-tickets-msg');
            const clearBtn = document.getElementById('clearBtn');

            // 2. clear previous content to avoid duplicates
            container.innerHTML = ''; 

            // 3. Handle Empty State
            if (tickets.length === 0) {
                noTicketsMsg.classList.remove('hidden'); // Show "No tickets" message
                clearBtn.classList.add('hidden'); // Hide clear button
                return;
            }

            // 4. If tickets exist, show content
            noTicketsMsg.classList.add('hidden');
            clearBtn.classList.remove('hidden');

            const now = new Date();

            // 5. Loop through each ticket and create HTML
            tickets.forEach(ticket => {
                
                // --- Expiration Logic ---
                const expiryDate = new Date(ticket.expiresAt);
                // Check if current time is past the expiry date
                const isExpired = now > expiryDate;

                // Define styling variables
                let statusText = '';
                let statusColorClass = '';
                let statusIcon = '';
                let bgGradient = '';
                let opacityClass = '';

                if (isExpired) {
                    statusText = "EXPIRED";
                    statusColorClass = "text-red-600 bg-red-100";
                    statusIcon = "fa-circle-xmark";
                    bgGradient = "from-gray-400 to-gray-500"; // Dull grey for expired
                    opacityClass = "opacity-75"; // Fade out the card slightly
                } else {
                    statusText = "ACTIVE";
                    statusColorClass = "text-green-600 bg-green-100";
                    statusIcon = "fa-circle-check";
                    bgGradient = "from-blue-500 to-blue-700"; // Bright blue for active
                    opacityClass = "";
                }

                // Format the Flight Date for display (e.g., "Mon, Oct 25")
                const flightDateObj = new Date(ticket.date);
                const dateStr = flightDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
                // Format Expiry Date for display
                const expiryStr = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                // 6. Build the HTML Card String
                const cardHTML = `
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 ${opacityClass}">
                    <!-- Card Header (Color strip) -->
                    <div class="bg-gradient-to-r ${bgGradient} p-4 text-white flex justify-between items-center relative ticket-cutout">
                        <div class="flex items-center space-x-2 z-10">
                            <i class="fa-solid fa-plane-up"></i>
                            <span class="font-bold tracking-wider text-lg">${ticket.flightNumber}</span>
                        </div>
                        <div class="text-right z-10">
                            <div class="text-xs opacity-80">Class</div>
                            <div class="font-bold text-sm uppercase">${ticket.classType}</div>
                        </div>
                    </div>
                    
                    <!-- Card Body -->
                    <div class="p-5">
                        <!-- Route Info (From -> To) -->
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

                        <!-- Details Grid -->
                        <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                            <div>
                                <div class="text-xs text-gray-400">Passenger</div>
                                <div class="font-semibold text-gray-700 truncate">${ticket.passenger}</div>
                            </div>
                            <div>
                                <div class="text-xs text-gray-400">Flight Date</div>
                                <div class="font-semibold text-gray-700">${dateStr}</div>
                            </div>
                        </div>

                        <!-- Footer: Status & Delete Action -->
                        <div class="mt-4 flex justify-between items-center pt-2">
                            <div class="flex flex-col">
                                <div class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${statusColorClass}">
                                    <i class="fa-solid ${statusIcon}"></i>
                                    ${statusText}
                                </div>
                                <span class="text-[10px] text-gray-400 mt-1 ml-1">
                                    ${isExpired ? 'Expired on' : 'Expires on'} ${expiryStr}
                                </span>
                            </div>
                            
                            <button onclick="deleteTicket('${ticket.id}')" class="text-gray-400 hover:text-red-500 transition p-2" title="Remove Ticket">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
                
                // 7. Inject HTML into container
                container.innerHTML += cardHTML;
            });
        }

        // --- Utility Functions ---

        // Function to delete a single ticket by ID
        function deleteTicket(id) {
            // 1. Confirm with user
            if(!confirm("Remove this ticket from your history?")) return;
            
            // 2. Get current list
            let tickets = getStoredTickets();
            // 3. Filter out the one with matching ID
            tickets = tickets.filter(t => t.id !== id);
            // 4. Save updated list
            localStorage.setItem('skybound_tickets', JSON.stringify(tickets));
            // 5. Re-render the view
            renderTickets();
        }

        // Function to wipe all data
        function clearAllTickets() {
            // 1. Double check with user (destructive action)
            if(!confirm("Are you sure you want to delete ALL booking history?")) return;
            // 2. Remove key from storage
            localStorage.removeItem('skybound_tickets');
            // 3. Re-render (will show empty state)
            renderTickets();
        }

        // Set default date input to today's date when page loads
        document.getElementById('flightDate').valueAsDate = new Date();