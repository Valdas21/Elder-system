import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import { jwtDecode } from "jwt-decode";
import ElderAppBar from "./AppBars/ElderAppBar";
import AnonymousAppBar from "./AppBars/AnonymousAppBar";
import Footer from "./Footers/Footer";
import { useNavigate } from "react-router-dom";

type Question = {
  id?: number | string;
  text?: string;
  [key: string]: any;
};

function Questions() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("jwtToken") || "", []);
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const role = useMemo(() => {
    if (!token) return undefined;
    try {
      const d: any = jwtDecode(token);
      console.log("Decoded JWT payload:", d);
      return (d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? d["role"]) as string | undefined;
    } catch {
      return undefined;
    }
  }, [token]);

  const isAuthenticated = !!token;
  const isAdmin = role?.toLowerCase() === "admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newText, setNewText] = useState("");

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Question[]>("/api/Questions", { headers });
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLoading(false);
      return;
    }
    loadQuestions();
    // ...existing cleanup...
  }, [isAuthenticated, isAdmin]);

  const handleCreate = async () => {
    if (!isAdmin || !newText.trim()) return;
    try {
      await axios.post("/api/Questions", { text: newText.trim() }, { headers });
      setNewText("");
      loadQuestions();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to create question.");
    }
  };

  const handleDelete = async (id?: number | string) => {
    if (!isAdmin || id == null) return;

    // Optional confirm
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    // Backend uses [HttpDelete] without a route template; pass id as query string
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      setError("Invalid question id.");
      return;
    }

    try {
      await axios.delete("/api/Questions", {
        params: { id: idNum },
        headers,
      });
      setQuestions(qs => qs.filter(q => Number(q.id) !== idNum));
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to delete question.";
      // Show error but do not alter the questions list
      setError(String(msg));
    }
  };

  return (
    <>
      {isAuthenticated ? <ElderAppBar /> : <AnonymousAppBar />}
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">Questions</Typography>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        </Box>

        {!isAuthenticated || !isAdmin ? (
          <Alert severity="error">Access denied. Admins only.</Alert>
        ) : (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Create new question</Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Question text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                  />
                  <Button variant="contained" onClick={handleCreate}>Create</Button>
                </Box>
              </CardContent>
            </Card>

            {loading ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Show error above the table without replacing it */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TableContainer component={Card}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Text</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Alert severity="info">No questions found.</Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        questions.map((q, idx) => (
                          <TableRow key={q.id ?? idx} hover>
                            <TableCell>{q.id ?? "-"}</TableCell>
                            <TableCell>{q.text ?? "-"}</TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDelete(q.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default Questions;
