import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ElderAppBar from "./AppBars/ElderAppBar";
import Footer from "./Footers/Footer";
import { jwtDecode } from "jwt-decode";

type Question = {
  id?: number | string;
  text?: string;
  [key: string]: any;
};

function Form() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => localStorage.getItem("jwtToken") || "", []);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setError("Missing form id.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await axios.get<Question[]>(`/api/Forms/${id}/Questions`, { headers });
        console.log("Fetched questions:", res.data);
        if (mounted) setQuestions(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load questions.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  return (
    <>
      <ElderAppBar />
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Form {id}
          </Typography>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            {questions.length === 0 ? (
              <Alert severity="info">No questions for this form.</Alert>
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Questions
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {questions.map((q, idx) => (
                      <Box key={q.id ?? idx} sx={{ p: 2, border: "1px solid #eee", borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {q} 
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default Form;
