       function initApp() {
           const dateInput = document.getElementById('flightDate');
           const today = new Date();
           const yyyy = today.getFullYear();
           const mm = String(today.getMonth() + 1).padStart(2, '0');
           const dd = String(today.getDate()).padStart(2, '0');
           
           // Format today's date for HTML input (YYYY-MM-DD)
           const todayStr = `${yyyy}-${mm}-${dd}`;
           
           // Sbbta dates ka hore loo doora karin 
           dateInput.min = todayStr;
           dateInput.value = todayStr;
       }

       function navigateTo(pageId) {
           const pages = ['home', 'book', 'my-tickets', 'about'];
           pages.forEach(p => document.getElementById(p + '-page').classList.add('hidden'));
           document.getElementById(pageId + '-page').classList.remove('hidden');
           
           document.getElementById('mobile-menu').classList.add('hidden');
           document.getElementById('menu-icon').className = "fa-solid fa-bars-staggered text-xl";
           
           window.scrollTo({top: 0, behavior: 'smooth'});
           if (pageId === 'my-tickets') Tickets();
       }
       function toggleMobileMenu() {
           const menu = document.getElementById('mobile-menu');
           const icon = document.getElementById('menu-icon');
           const isHidden = menu.classList.toggle('hidden');
           icon.className = isHidden ? "fa-solid fa-bars-staggered text-xl" : "fa-solid fa-xmark text-xl";
       }
       function Booking(event) {
           event.preventDefault();
           const name = document.getElementById('fullName').value.trim();
           const from = document.getElementById('fromAirport').value.trim();
           const to = document.getElementById('toAirport').value.trim();
           const dateVal = document.getElementById('flightDate').value;
           const flightClass = document.getElementById('flightClass').value;
           
           // no number to be included
           const lettersOnly = /^[A-Za-z\s]+$/;
           if (!name || !from || !to || !dateVal || !flightClass) {
               alert("ACCESS DENIED: All fields must be completed.");
               return;
           }
           if (!lettersOnly.test(name)) {
               alert("IDENTITY ERROR: Passenger names cannot contain numeric characters.");
               return;
           }
           if (!lettersOnly.test(from) || !lettersOnly.test(to)) {
               alert("LOCATION ERROR: Airport codes must contain letters only.");
               return;
           }
           // Secondary check just in case someone bypasses the 'min' attribute
           const selectedDate = new Date(dateVal);
           const today = new Date();
           today.setHours(0, 0, 0, 0); 
           if (selectedDate < today) {
               alert("CHRONOLOGICAL ERROR: You cannot book a flight in the past.");
               return;
           }
           // --- DATA STORAGE ---
           const ticket = {
               id: 'SB-' + Date.now(),
               name: name,
               class: flightClass,
               from: from,
               to: to,
               date: dateVal,
               flightNum: 'SB' + Math.floor(1000 + Math.random() * 9000),
               expireDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
           };
           const db = JSON.parse(localStorage.getItem('skybound_vault') || '[]');
           db.unshift(ticket);
           localStorage.setItem('skybound_vault', JSON.stringify(db));
           
           document.getElementById('bookingForm').reset();
           initApp(); // Reset the date input back to today and keep 'min' restriction
           
           navigateTo('my-tickets');
       }
       
       function Tickets() {
           const container = document.getElementById('tickets-container');
           const emptyMsg = document.getElementById('no-tickets-msg');
           const clearBtn = document.getElementById('clearBtn');
           const tickets = JSON.parse(localStorage.getItem('skybound_vault') || '[]');
           const rightnow = Date.now();
           container.innerHTML = '';
           
           if (tickets.length === 0) {
               emptyMsg.classList.remove('hidden');
               clearBtn.classList.add('hidden');
               return;
           }
           // tickdets markoo dhacaayo color ka waa laga badalaa 
           emptyMsg.classList.add('hidden');
           clearBtn.classList.remove('hidden');
           tickets.forEach(t => {
               const Expired = rightnow > t.expireDate;
               const card = `
               <div class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 transition-all hover:-translate-y-1 ${Expired ? 'opacity-50 grayscale' : ''}">
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
                               VALID: ${new Date(t.expireDate).toLocaleDateString()}
                           </div>
                           <button onclick="deleteTicket('${t.id}')" class="text-gray-200 hover:text-red-500 transition p-2">
                               <i class="fa-solid fa-trash-can"></i>
                           </button>
                       </div>
                   </div>
               </div>`;
               container.innerHTML += card;
           });
       }
       
       function deleteTicket(id) {
           if (confirm("Are you sure you want to remove this specific Ticket?")) {
               let db = JSON.parse(localStorage.getItem('skybound_vault') || '[]');
               db = db.filter(t => t.id !== id);
               localStorage.setItem('skybound_vault', JSON.stringify(db));
               Tickets();
           }
       }
function clearAllTickets() {
    if (confirm("CRITICAL: Wipe your entire digital travel history?")) {
        localStorage.removeItem('skybound_vault');
        Tickets();
    }
}
       
initApp();