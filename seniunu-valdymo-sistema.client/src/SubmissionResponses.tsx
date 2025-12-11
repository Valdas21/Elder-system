import { useEffect, useMemo, useState } from "react";
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

type ApiResponseItem = {
  id: number;
  text: string;
  fkFormQuestionId: number;
  fkSubmissionId: number;
  formQuestion?: {
    id: number;
    fkFormId: number;
    fkQuestionId: number;
    question?: { id: number; text: string };
    form?: string; // form title/name
  };
  submission?: string;
};

function SubmissionResponses() {
  const { id: submissionIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const editRequested = !!(location.state as { edit?: boolean } | null)?.edit;

  const token = useMemo(() => localStorage.getItem("jwtToken") || "", []);
  // Derive isAdmin from token roles
  const isAdmin = useMemo(() => {
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      const roles =
        decoded["roles"] ??
        decoded["role"] ??
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        [];
      const rolesArr = Array.isArray(roles) ? roles : [roles].filter(Boolean);
      return rolesArr.some((r: string) => r.toLowerCase() === "admin");
    } catch {
      return false;
    }
  }, [token]);

  const [responses, setResponses] = useState<ApiResponseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Add: local editable copy and edit mode
  const [editMode, setEditMode] = useState<boolean>(editRequested);
  // Change: edit map keyed by fkFormQuestionId
  const [edited, setEdited] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const submissionId = Number(submissionIdParam);
      if (!Number.isFinite(submissionId)) {
        setError("Invalid submission id.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const decoded: any = jwtDecode(token);
        const rawElderId =
          decoded["sub"] ??
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
          decoded["nameid"] ??
          decoded["userId"];
        const res = await axios.get<ApiResponseItem[]>(
          `/api/Submissions/${submissionId}/Responses`,
          { params: { elderId: rawElderId }, headers }
        );
        if (mounted) {
          const data = Array.isArray(res.data) ? res.data : [];
          setResponses(data);
          // initialize edited map by fkFormQuestionId
          const init: Record<number, string> = {};
          data.forEach((r) => {
            init[r.fkFormQuestionId] = r.text ?? "";
          });
          setEdited(init);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load submission responses.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [submissionIdParam, token]);

  const formTitle = responses[0]?.formQuestion?.form ?? "Form";
  const getQuestionText = (r: ApiResponseItem) =>
    r.formQuestion?.question?.text ?? `Question ${r.fkFormQuestionId}`;

  // Add: handlers for editing and saving
  const handleChange = (responseFkFormQuestionId: number, value: string) => {
    setEdited((prev) => ({ ...prev, [responseFkFormQuestionId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const submissionId = Number(submissionIdParam);
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      // Build UpdateSubmissionRequest payload
      const payload = {
        Responses: responses.map((r) => ({
          FkFormQuestionId: r.fkFormQuestionId,
          Text: edited[r.fkFormQuestionId] ?? r.text ?? "",
        })),
      };

      await axios.put(`/api/Submissions/${submissionId}`, payload, { headers });
      setSaveSuccess("Updates saved.");
      // sync local responses with edited values
      setResponses((prev) =>
        prev.map((r) => ({
          ...r,
          text: edited[r.fkFormQuestionId] ?? r.text,
        }))
      );
      setEditMode(false);
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Failed to save updates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ElderAppBar />
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Submission {submissionIdParam} - {formTitle}
          </Typography>
          <Box display="flex" gap={1}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
            {/* Hide edit controls for admin */}
            {!isAdmin && !loading && !error && responses.length > 0 && (
              editMode ? (
                <>
                  <Button variant="contained" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="text" disabled={saving} onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setEditMode(true)}>Edit</Button>
              )
            )}
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
        {!loading && saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}

        {!loading && !error && (
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                {responses.length === 0 ? (
                  <Alert severity="info">No responses found for this submission.</Alert>
                ) : (
                  responses.map((r) => (
                    <Box key={r.id} sx={{ p: 2, border: "1px solid #eee", borderRadius: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {getQuestionText(r)}
                      </Typography>
                      {editMode ? (
                        <input
                          type="text"
                          value={edited[r.fkFormQuestionId] ?? ""}
                          onChange={(e) => handleChange(r.fkFormQuestionId, e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: 4,
                            border: "1px solid #ccc",
                          }}
                        />
                      ) : (
                        <Typography variant="body1">{r.text || "-"}</Typography>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default SubmissionResponses;