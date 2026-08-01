import { app } from "./app.js";
import { port } from "./constants/constants.js";
app.listen(port, () => {
    console.log("Server running on port: ", port);
});
