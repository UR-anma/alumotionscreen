# Operator screen example

This urCap is a small example of an operator screen urCapx for Polyscope X, showcasing the operator screen capabilities for a machine tending setup, where different formats can be configured.
Due to a small bug in the script generation capabilities, currently the whole data model is stored on the back-end and data is retrieved at runtime.

Currently available capabilities:

- Teaching waypoints and inputting data via the operator screen
- Docker backend using xml-rpc to communicate with robot program and front-end
- Operator screen reacts to program state (paly/pause/stop)

# Angular contribution

This project is a template example of a URCap Contribution containing a Docker backend and a Web frontend

### Installation
To install the contribution type:

`$ npm install`

### Build
To build the contribution type:

`$ npm run build`

### Deploy
To deploy the contribution to the simulator type:

`$ npm run install-urcap`

## Further help

Get more help from the included SDK documentation.
