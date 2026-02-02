function navigateTo(pageId) {
    // List of all section IDs
    const pages = ['home', 'book', 'my-tickets', 'about'];
    
    // Loop through all pages: hide them
    pages.forEach(p => document.getElementById(p + '-page').classList.add('hidden'));
    
    // Show only the one the user clicked
    document.getElementById(pageId + '-page').classList.remove('hidden');
    
    // Close mobile menu if it's open
    document.getElementById('mobile-menu').classList.add('hidden');
    document.getElementById('menu-icon').className = "fa-solid fa-bars-staggered text-xl";
    
    // Scroll to the top of the window for a fresh view
    window.scrollTo({top: 0, behavior: 'smooth'});
    
    // If navigating to the Vault, we need to refresh the ticket list
    if (pageId === 'my-tickets') renderTickets();
    }
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    const isHidden = menu.classList.toggle('hidden');
    // Swap icons between bars and X mark
    icon.className = isHidden ? "fa-solid fa-bars-staggered text-xl" : "fa-solid fa-xmark text-xl";
}
/**
 * SECTION 3: TICKET STORAGE & CREATION
 * Handles form submission, object creation, and LocalStorage.
 */
function handleBooking(event) {
    // Prevent the browser from actually submitting the form (reloading the page)
    event.preventDefault();
    
    // Create a structured Ticket Object
    const ticket = {
        id: 'SB-' + Date.now(), // Unique ID using timestamp
        name: document.getElementById('fullName').value,
        class: document.getElementById('flightClass').value,
        from: document.getElementById('fromAirport').value,
        to: document.getElementById('toAirport').value,
        date: document.getElementById('flightDate').value,
        flightNum: 'SB' + Math.floor(1000 + Math.random() * 9000), // Random flight number
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now in milliseconds
    };
    // Retrieve existing tickets from LocalStorage (or create empty array if none)
    const db = JSON.parse(localStorage.getItem('skybound_vault') || '[]');
    
    // Add new ticket to the beginning of the list
    db.unshift(ticket);
    
    // Save updated list back to LocalStorage
    localStorage.setItem('skybound_vault', JSON.stringify(db));
    
    // Reset form fields and redirect to the Vault
    document.getElementById('bookingForm').reset();
    navigateTo('my-tickets');
}
/**
 * SECTION 4: RENDERING (UI GENERATION)
 * Converts the data in LocalStorage into physical HTML elements.
 */
function renderTickets() {
        const container = document.getElementById('tickets-container');
        const emptyMsg = document.getElementById('no-tickets-msg');
        const clearBtn = document.getElementById('clearBtn');
        
        // Get data from storage
        const tickets = JSON.parse(localStorage.getItem('skybound_vault') || '[]');
        const now = Date.now();
        // Clear current view before re-rendering
        container.innerHTML = '';
        
        // Toggle "Empty Vault" message if no tickets exist
        if (tickets.length === 0) {
            emptyMsg.classList.remove('hidden');
            clearBtn.classList.add('hidden');
            return;
        }
        emptyMsg.classList.add('hidden');
        clearBtn.classList.remove('hidden');
        // Map through each ticket and generate the HTML card
        tickets.forEach(t => {
            const isExpired = now > t.expiresAt;
            const card = `
            <div class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 transition-all hover:-translate-y-1 ${isExpired ? 'opacity-50 grayscale' : ''}">
                <div class="bg-burgundy py-5 text-center relative overflow-hidden">
                    <h4 class="relative z-10 font-black text-white text-sm tracking-[0.5em] uppercase">SKY<span class="text-champagne">BOUND</span></h4>
                </div>
                <div class="p-8 sm:p-10">
                    <div class="flex justify-between items-center mb-10">
                        <div>
                            <p class="text-3xl font-black text-burgundy uppercase tracking-tight">${t.from}</p>
                            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Origin</p>
                        </div>
                        <div class="flex-grow px-6 flex flex-col items-center">
                            <i class="fa-solid fa-plane-up text-champagne text-xs transform rotate-45 mb-2"></i>
                            <div class="w-full h-0.5 bg-gray-100 rounded-full relative">
                                <div class="absolute inset-0 bg-champagne w-1/3 rounded-full"></div>
                            </div>
                            <p class="text-[9px] font-black text-gray-400 mt-2 tracking-[0.3em] uppercase">${t.flightNum}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-black text-burgundy uppercase tracking-tight">${t.to}</p>
                            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Dest.</p>
                        </div>
                    </div>
                    <div class="border-t border-dashed border-gray-100 pt-6 mb-6">
                        <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lead Passenger</p>
                        <p class="text-xl font-black text-gray-800 uppercase truncate">${t.name}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4 bg-offwhite p-5 rounded-2xl">
                        <div>
                            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cabin</p>
                            <p class="text-sm font-black text-burgundy uppercase">${t.class}</p>
                        </div>
                        <div>
                            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                            <p class="text-sm font-black text-burgundy uppercase">${new Date(t.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-between items-center">
                        <div class="text-[9px] font-black text-gray-400 tracking-widest">
                            VALID: ${new Date(t.expiresAt).toLocaleDateString()}
                        </div>
                        <button onclick="deleteTicket('${t.id}')" class="text-gray-200 hover:text-red-500 transition p-2">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
            container.innerHTML += card;
        });
   }
     /**
      * SECTION 5: DELETION LOGIC
      */
function deleteTicket(id) {
    // Filter out the ticket with the matching ID
    let db = JSON.parse(localStorage.getItem('skybound_vault') || '[]');
    db = db.filter(t => t.id !== id);
    
    // Save the filtered list back to storage
    localStorage.setItem('skybound_vault', JSON.stringify(db));
    
    // Re-render to show changes
    renderTickets();
}
function clearAllTickets() {
    // Standard browser confirmation before wiping everything
    if (confirm("Permanently erase your travel vault?")) {
        localStorage.removeItem('skybound_vault');
        renderTickets();
    }
}
// AUTO-INIT: Set the date picker to today's date when the script loads
document.getElementById('flightDate').valueAsDate = new Date();