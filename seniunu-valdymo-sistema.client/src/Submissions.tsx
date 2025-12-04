import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

type Submission = {
  id?: number;
  Id?: number;
  fkFormId?: number;
  FkFormId?: number;
  formTitle?: string;
  FormTitle?: string;
  fillDate?: string;
  SubmittedAt?: string;
  responses?: Array<{ text?: string; Text?: string }>;

};

function Submissions() {
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("jwtToken") || "", []);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derive elderId from token and ensure it's a number
  const elderId = useMemo(() => {
    if (!token) return undefined;
    try {
      const d: any = jwtDecode(token);
      console.log('Decoded JWT token:', d);
      const raw =
        d["sub"] ??
        d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
        d["nameid"] ??
        d["userId"];
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    } catch {
      return undefined;
    }
  }, [token]);

  const getId = (s: Submission) => s.id ?? s.Id;
  const getFormId = (s: Submission) => s.fkFormId ?? s.FkFormId;
  const getFormTitle = (s: Submission) => s.formTitle ?? s.FormTitle ?? `Form ${getFormId(s) ?? ""}`;
  const getSubmittedAt = (s: Submission) => s.fillDate;
  const getResponseCount = (s: Submission) => (Array.isArray(s.responses) ? s.responses.length : 0);

  // Add: view and delete handlers
  const handleView = (s: Submission) => {
    const Id = getId(s);
    if (!Id) return;
    // Navigate to form; if you have a dedicated submission details route, adjust here.
    navigate(`/Submissions/${Id}/Responses`);
  };

  const handleDelete = async (s: Submission) => {
    const submissionId = getId(s);
    if (!submissionId) return;
    const ok = window.confirm("Delete this submission? This cannot be undone.");
    if (!ok) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      // Adjust endpoint if your API uses a different pattern
      await axios.delete(`/api/Submissions/${submissionId}`, { headers });
      // Optimistically update UI
      setSubmissions(prev => prev.filter(x => getId(x) !== submissionId));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete submission.");
    }
  };

  // Add: navigate to edit mode
  const handleEdit = (s: Submission) => {
    const Id = getId(s);
    if (!Id) return;
    navigate(`/Submissions/${Id}/Responses`, { state: { edit: true } });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!elderId) {
        setError("Missing elder id.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await axios.get<Submission[]>(`/api/Submissions/ByElder`, {
          params: { elderId },
          headers,
        });
        console.log("Fetched submissions:", res.data);
        if (mounted) setSubmissions(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load submissions.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [elderId, token]);

  return (
    <>
      <ElderAppBar />
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Submissions for elder {elderId ?? "Unknown"}
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
            {submissions.length === 0 ? (
              <Alert severity="info">No submissions found for this elder.</Alert>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {submissions.map((s) => {
                  const sid = String(getId(s) ?? `${getFormId(s)}-${getSubmittedAt(s)}`);
                  return (
                    <Card key={sid}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {getFormTitle(s)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Submitted at: {getSubmittedAt(s) || "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Responses: {getResponseCount(s)}
                        </Typography>
                        {/* Actions */}
                        <Box mt={2} display="flex" gap={1}>
                          <Button size="small" variant="outlined" onClick={() => handleView(s)}>
                            View
                          </Button>
                          <Button size="small" variant="outlined" onClick={() => handleEdit(s)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleDelete(s)}
                          >
                            Delete
                          </Button>
                        </Box>
                        {/* ...existing code... add navigation if you have a details page */}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default Submissions;