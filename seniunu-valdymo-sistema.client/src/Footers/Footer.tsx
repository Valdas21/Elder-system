import React from "react";
import { Box } from "@mui/material";

function Footer(){
  return (
    <>
      {/* Dots */}
      <Box sx={{ paddingTop: 15 }} display="flex" justifyContent="center" mt={5} gap={3}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Box
            key={n}
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2px solid black",
            }}
          />
        ))}
      </Box>

      {/* Footer text */}
      <Box textAlign="center" mt={6} color="gray">
        © 2025 &nbsp; Privacy — Terms
      </Box>
    </>
  );
}

export default Footer;