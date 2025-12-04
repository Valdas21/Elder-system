import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Id?: number | string;
  text?: string;
  Text?: string;
  [key: string]: any;
};

function Form() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { active?: boolean } | null;
  const isActive = !!routeState?.active;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add: track if elder has already submitted this form
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const token = useMemo(() => localStorage.getItem("jwtToken") || "", []);

  // Helper: get elder id from token (prefer numeric id)
  const elderId = useMemo(() => {
    if (!token) return undefined;
    try {
      const d: any = jwtDecode(token);
      // Try common claim keys
      const rawId =
        d["sub"] ??
        d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
        d["nameid"] ??
        d["userId"];
      const parsed = Number(rawId);
      return Number.isFinite(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [token]);

  // Helpers to read API fields safely
  const getQId = (q: Question) => {
    const raw = q.id ?? q.Id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };
  const getQText = (q: Question) => (q.text ?? q.Text ?? "") as string;

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
        const qs = Array.isArray(res.data) ? res.data : [];
        if (mounted) {
          setQuestions(qs);
          // initialize empty answers
          const init: Record<string, string> = {};
          qs.forEach(q => {
            const qid = getQId(q);
            if (qid !== undefined) init[String(qid)] = "";
          });
          setAnswers(init);
        }
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

  // Add: check if current elder has already submitted this form
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id || !elderId) return;
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        // Try a simple "exists" endpoint. Adjust to your API if different.
        // If your API returns 200 with { exists: boolean } or 204, adapt accordingly.
        const res = await axios.get(`/api/Submissions/ByFormAndElder`, {
          params: { formId: id, elderId },
          headers,
        });
        // Accept various response shapes
        const exists =
          res?.data?.exists === true ||
          res?.status === 204 ||
          (Array.isArray(res?.data) && res.data.length > 0);
        if (mounted) setHasSubmitted(!!exists);
      } catch {
        // Fail-safe: do not block form if endpoint fails
        if (mounted) setHasSubmitted(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, elderId, token]);

  const handleAnswerChange = (qid: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const handleSubmit = async () => {
    // Prevent submitting if already submitted
    if (hasSubmitted) return;
    if (!id) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      // Build payload according to:
      // CreateSubmissionRequest { FkFormId, FkElderId, Responses: [{ FkFormQuestionId, Text }] }
      const fkFormId = Number(id);
      const fkElderId = elderId;
      if (!Number.isFinite(fkFormId) || !Number.isFinite(fkElderId!)) {
        throw new Error("Invalid form or elder id.");
      }

      const responses = Object.entries(answers).map(([questionId, value]) => ({
        FkFormQuestionId: Number(questionId),
        Text: String(value ?? ""),
      }));

      const payload = {
        FkFormId: fkFormId,
        FkElderId: fkElderId,
        Responses: responses,
      };
      console.log("Submitting payload:", payload);
      await axios.post(`/api/Submissions`, payload, { headers });
      setSubmitSuccess("Submission successful.");
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message || e?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

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
                  {!isActive && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      This form is inactive. Submissions are disabled.
                    </Alert>
                  )}
                  {hasSubmitted && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      You have already submitted this form. Editing is disabled. Check submissions instead.
                    </Alert>
                  )}
                  {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                  {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>{submitSuccess}</Alert>}
                  <Box display="flex" flexDirection="column" gap={2}>
                    {questions.map((q, idx) => {
                      const qidNum = getQId(q);
                      const qid = String(qidNum ?? idx);
                      return (
                        <Box key={qid} sx={{ p: 2, border: "1px solid #eee", borderRadius: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {getQText(q) || `Question ${idx + 1}`}
                          </Typography>
                          {/* Simple text answer input; adjust by type if needed */}
                          <input
                            type="text"
                            value={answers[qid] ?? ""}
                            onChange={(e) => handleAnswerChange(qid, e.target.value)}
                            disabled={!isActive || hasSubmitted}
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: 4,
                              border: "1px solid #ccc",
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>

                  <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="contained"
                      disabled={!isActive || hasSubmitted || submitting}
                      onClick={handleSubmit}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </Button>
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
