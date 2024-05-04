# Technical Specification Documentation

**Note:** Some items have not yet been pushed to stage.

## Model Representations and API Routes

### Backend Models

#### RoomDetails Model

- Added new fields:
  - `width`: float
  - `height`: float
  - `tables`: list[Table] = []

#### NewSeatDetail Model

- Created to represent new seats passed into the backend.

#### Seat Model

- Added the `rotation` field to store rotation in the backend.

#### TableIdentity Model

- Parent model for the Table model, containing:
  - `id`: int

#### TableDetails Model

- Extends the Table model, containing:
  - `room`: Room

#### NewTableDetails Model

- Extends the NewTable model, containing:
  - `room`: Room

#### Table Model

- Created to store positional data about each table in a room.
- Contains:
  - `x`: int
  - `y`: int
  - `width`: int
  - `height`: int
  - `rotation`: int
  - `radius`: int | None
  - `is_circle`: bool

#### NewTable Model

- Created as an extension of the Table model.
- Contains:
  - `id`: int | None = None

### Frontend Models

#### RoomItem Interface

- Base model for Room and Table interface, used to simplify functions in RoomItem Service.
- Contains:
  - `id`: number
  - `x`: number
  - `y`: number
  - `width`: number
  - `height`: number
  - `rotate`: number
  - `selectedForResizing`: boolean

#### Seat Interface

- Extends RoomItem and represents a single seat in the seating editor and chart.
- Contains:
  - `title`: string
  - `shorthand`: string
  - `reservable`: boolean
  - `has_monitor`: boolean
  - `sit_stand`: boolean
  - `image_path`: string

#### Table Interface

- Extends RoomItem and represents a single table in the seating editor and chart (WIP).
- Contains:
  - `radius`: number | null
  - `is_circle`: boolean

### API

#### Get All Seats API

- **Endpoint**: `GET /api/seat`
- **Description**: Retrieves all seats managed by the seat service.
- **Response Model**: `list[SeatDetails]`
- **Operation Details**: Returns a list of all seats present in the database without any filters.
- **Tags**: Seats

#### Get Seat by ID API

- **Endpoint**: `GET /api/seat/{id}`
- **Description**: Fetches a seat by its unique identifier.
- **Parameters**:
  - `id`: An integer that uniquely identifies a seat.
- **Response Model**: `SeatDetails`
- **Operation Details**: Returns the details of a specific seat identified by the `id`.
- **Tags**: Seats

#### Get Seats by Room ID API

- **Endpoint**: `GET /api/seat/room/{room_id}`
- **Description**: Retrieves all seats located in a specified room.
- **Parameters**:
  - `room_id`: A string identifier for a room to fetch seats from.
- **Response Model**: `list[SeatDetails]`
- **Operation Details**: Returns a list of seats associated with the specified `room_id`.
- **Tags**: Seats

#### Create Seat API

- **Endpoint**: `POST /api/seat`
- **Description**: Creates a new seat in the database.
- **Parameters**:
  - `seat`: A `NewSeatDetails` object containing the details of the seat to be created.
- **Response Model**: `SeatDetails`
- **Operation Details**: Adds a new seat to the database and returns the created seat details.
- **Authorization Required**: Yes (User must be a registered user).
- **Tags**: Seats

#### Update Seat API

- **Endpoint**: `PUT /api/seat`
- **Description**: Updates an existing seat's details.
- **Parameters**:
  - `seat`: A `SeatDetails` object containing the updated details of the seat.
- **Response Model**: `SeatDetails`
- **Operation Details**: Updates an existing seat in the database and returns the updated seat details.
- **Authorization Required**: Yes (User must be a registered user).
- **Tags**: Seats

#### Update Multiple Seats API

- **Endpoint**: `PUT /api/seat/multiple`
- **Description**: Updates multiple seats in the database.
- **Parameters**:
  - `seats`: A list of `SeatDetails` objects each containing the updated details of a seat.
- **Response Model**: `list[SeatDetails]`
- **Operation Details**: Updates multiple seats based on the provided list and returns the updated details of all seats.
- **Authorization Required**: Yes (User must be a registered user).
- **Tags**: Seats

#### Delete Seat API

- **Endpoint**: `DELETE /api/seat/{id}`
- **Description**: Deletes a seat from the database.
- **Parameters**:
  - `id`: An integer that uniquely identifies a seat to be deleted.
- **Response Model**: None (HTTP Status Code indicates result)
- **Operation Details**: Removes a seat from the database based on the provided `id`.
- **Authorization Required**: Yes (User must be a registered user).
- **Tags**: Seats

## Database/Entity-level Representation Decisions

- Additional mapped fields were added to the Room and Seat entities to account for changes to the respective model fields.
- `to_model` and `from_model` functions were similarly changed.

## Technical Design Choices

- Changed the backend `reservation.py` service, specifically the `draft_reservation` function, to create reservations with multiple seats. This allows users to select and pass a list of seats from the frontend to the backend for reservation purposes.
- Chose to create a separate seat and table API rather than updating the existing room API to affect seats and tables in that specific room. This decision was made to allow users to update and create specific chairs and seats rather than updating the entire room.

## UX Design Choice

- Redesigned the coworking homepage to display the room map widget on the left and the drop-in card widget on the right. This makes the homepage more compact so that users can see all essential information on one screen and avoids scaling issues with the room map widget.
- Modified the Seat Selection component and the Reservation Card Widget to include a list of seats so that users can see which seats they are reserving/have reserved, enabling effective reservation of multiple seats at once.

## Getting Started Guide for New Developers

### Project Overview

- Familiarize with the project's features, focusing on the room map and seating chart components.

### Key Components

**Frontend:**

- RoomMapWidget: Manages room map display and interactions.
- SeatingChartWidget: Manages the display of individual seats in each room.
- RoomSelectionComponent: Handles room selection and navigation.

**Backend:**

- RoomAPI: Manages interactions between the user in the frontend and the data in the backend for the seating chart widget.
- RoomService: Performs operations on RoomEntity and SeatEntity based on what it is given by the RoomAPI.
- RoomEntity: Contains data for each room that is visualized in the frontend.
- SeatEntity: Contains data for each seat that is visualized in the frontend.

### Setup

1. Clone the repository and install dependencies.
2. Set up environment variables and database configurations.
3. Start the development servers for both frontend and backend.
