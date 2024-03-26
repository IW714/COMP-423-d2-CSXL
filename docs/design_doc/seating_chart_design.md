# Interactive Seating Chart Design Document 

### Contributors: 
- [Ivan Wu](https://github.com/IW714)
- [Weston Voglesonger](https://github.com/WestonVoglesonger)
- [Benjamin Zhang](https://github.com/bbbenzhang)
- [Wei Jiang](https://github.com/weijiangg)

## Overview:

With the implementation of a room reserving feature on the CSXL web application and the new coworking and pair programming labs, the addition of an interactive seating chart widget would allow students to see which seats are available or reserved in the CSXL lab or its surrounding rooms, and combined with a room’s specific reservation page, would enhance user experience when reserving seats.

## Key Personas:

The interactive seating chart will require multiple layers of user accessibility:

 - **Sally Student** can see any room’s seating chart which indicates which seats are currently available. Sally Student can select available seats and select up to a certain number of seats.    
   
 - **Ajay Ambassador** can oversee the reservation process via a room’s seating chart, and check students in and out of specific seats, along with all of the abilities of Sally Student.

 - **Rhonda Root** can manage rooms and seats by adding floor plans and seats, along with all the abilities of Ajay Ambassador and Sally Student.

## User Stories:
  1. As Sally Student, I want to be able to see a map of all rooms and be able to click on a room which will take me to the room’s specific seating chart.
  2. As Sally Student, I want to be able to see a room’s seating chart and which seats are available or unavailable so I know what I am able to reserve.
  3. As Sally Student, I want to be able to select a specific number of seats so that I can reserve them.
  4. As Ajay Ambassador, I want to be able to check students into and out of specific seats, and have no selection limit on the number of seats.
  5. As Ajay Ambassador, I want to be able to see all currently reserved seats and accompanying students.
  6. As Rhonda Root, I want to be able to create and edit rooms via a room editor, which will be included in the User Admin page.
  7. As Rhonda Root, I want to be able to manage a room’s seats by adding, editing, and deleting seats.

## Wireframes/Mockups:

### Sally Student

As Sally Student, Ajay Ambassador, and Rhonda Root, a new map will appear on the Coworking page of the CSXL website. From here, a user can click on one of the rooms and it will redirect them to the next frame.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/f0c982cc-5d14-4733-ada3-725d052a4a68)

Once redirected, a user can select individual seats to reserve.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/a92e0ea9-7500-4d96-8661-46f943417d6d)

When the user has decided which seat(s) they want to reserve, they click on the "reserve" button and are redirected to the reservation page currently used for coworking drop-ins.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/2a3fc677-3a9f-491c-a195-2be45aeb8ca6)

### Ajay Ambassador

As Ajay Ambassador, the workflow to search for a student to check in are the same. First, they start on the XL Ambassador page.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/9275f6d2-f15b-4f7c-9c68-ac5d6e47943a)

Then, once they select a student from the search bar, a new map will appear, along with the same drop in options as before. If Ajay Ambassador wants to reserve by specific room and seat(s), they will click a room on the map and be redirected.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/99a66397-5589-42ea-9806-0df6ccb279cd)

Once redirected, they can select seats to reserve or change the reservation of.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/393c50ac-5d93-40f1-a1ee-08ea685c8b41)

When the user has decided which seat(s) they want to reserve, they click on the "reserve" button and the reservation is made automatically.

### Rhonda Root

The User Admin page will now be updated to contain the list of rooms. This was moved here from the Academics page because we believed it made more sense to put it here. All functionality remains the same in terms of this page. 

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/bd6bf350-e2fa-432b-8241-329302b0c39b)

When Rhonda Root wants to create a new room or edit a room, they will click the "create" button or the "edit" button of a particular room, respectively. Then, they will be brought to the new Room Editor page.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/7b4cb5b1-d119-494b-8cd4-ec4578cc52ac)

After entering a floorplan, Rhonda Root can choose to preview what the floor plan will look like.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/5c08d0bf-c2c7-4e3c-8a4e-f2b57ecc0ac6)

On this map, Rhonda will also be able to click on a seat and edit it via the new seat editor page. This page can also be reached for creating new seats by clicking the "new seat" button.

![image](https://github.com/comp423-24s/csxl-final-team-d2/assets/59369257/dd5ed46f-0e44-4805-a238-7617b23104fd)

## Technical Implementation: 

**Dependencies:** 
 - User: When a seat is reserved, we need to keep track of who checked out the seat
 - Role: Different functionalities for students, ambassadors, and admins. 
	 - Authorization: Will need to rely on the authorization system to
	   know what role the user has.
 - Room: Room data will be used for capacity and location.
 - Reservation: When a seat is selected from the widget, we will need to connect the selected seat to the reservation system.
- Status: for the demo component, in order to integrate the seating chart widget with the XL Lab, we must utilize the coworking status to fetch seat availability.
 - Seat/SeatAvailability: Utilize the seat model to map the widget with X,Y fields. Seat data will also be used to determine availability, seat type, and seat ID.

**Extensions:** 
 - We will need to extend the room model and entity to include a floor plan as an SVG text field.
 - We will need to extend the seat entity and model to contain an SVG text field.
 - A new service for seats will be implemented in order to provide a more accessible way to CRUD seats.
 - Room Editor Component will be extended to contain the Seating Chart
   Widget.

**Page Components and Widgets:**

 - Coworking Room Map Widget: This component will be embedded into the coworking page and will show an SVG graphic of the map of rooms in the CSXL ecosystem.
 - Room Component: This component will navigate to a specific room
   component once a user selects a room in the Coworking Room Map
   Widget. The Room Component will contain an individual Seating Chart
   Widget, by which the widget can inherit and emit information.
 - Seating Chart Widget: This will show the floor plan of the room and
   also house the seats.
 - Seat Editor Component: This will be a linked component within the
   Room Editor Component. The idea is that this component will be
   navigated to once the user clicks on a seat in the Seating Chart
   Widget embedded in the Room Component.

**Models:** 
 - Room: Will be extended to hold SVG floorplan.
 - Seat: Will be extended to hold SVG shape, may need to be extended to
   include availability status.

**API/Routes:**
 - GET seats (/seat/{room}): Retrieves the seats in a room. Intended purpose is to get all the seats of a particular room.
 - POST Seat (/seat/{room}): Creates a seat based on the received information. Intended purpose is to add a seat to a particular room.
 - PUT seat (/seat/{room}): Updates a seat based on the received information. Intended purpose is to update the name or position of a seat in a particular room.
 - DELETE seat (/seat/{room}): Deletes a seat based on the received information. Intended purpose is to remove a seat from a particular room.

**Security and Privacy Concerns:**
 - Only ambassadors and administrators can edit reservations and see
   which user reserved the seat on the widget.
 - Only administrators can edit rooms and seats.
