import React, { useEffect, useMemo, useState } from "react";
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

type SummaryResponse = {
  elders?: number;
  forms?: number;
  submissions?: number;
};

type LatestSubmission = {
  id?: number;
  elderName?: string;
  formTitle?: string;
  filledAt?: string;
};

function AdminDashboard() {
  const token = useMemo(() => localStorage.getItem("jwtToken") || "", []);
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [summary, setSummary] = useState<SummaryResponse>({});
  const [latest, setLatest] = useState<LatestSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    try {
      const d: any = jwtDecode(token);
      const roles =
        d["roles"] ??
        d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        d["role"];
      const hasAdmin =
        (Array.isArray(roles) && roles.includes("admin")) ||
        roles === "admin";
      setIsAdmin(!!hasAdmin);
    } catch {
      setIsAdmin(false);
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAdmin) {
        setError("Access denied. Admins only.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Adjust endpoints to match your API
        const [sumRes, latestRes] = await Promise.all([
          axios.get<SummaryResponse>("/api/Admin/Summary", { headers }),
          axios.get<LatestSubmission[]>("/api/Admin/LatestSubmissions", { headers }),
        ]);
        if (mounted) {
          setSummary(sumRes.data || {});
          setLatest(Array.isArray(latestRes.data) ? latestRes.data : []);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load admin data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAdmin, token]);

  return (
    <>
      <ElderAppBar />
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Admin Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Button variant="outlined" href="/Forms">Forms</Button>
            <Button variant="outlined" href="/Elders">Elders</Button>
            <Button variant="outlined" href="/Submissions">Submissions</Button>
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2} mb={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Elders</Typography>
                  <Typography variant="h3">{summary.elders ?? "-"}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6">Forms</Typography>
                  <Typography variant="h3">{summary.forms ?? "-"}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6">Submissions</Typography>
                  <Typography variant="h3">{summary.submissions ?? "-"}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest submissions
                </Typography>
                {latest.length === 0 ? (
                  <Alert severity="info">No recent submissions.</Alert>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {latest.map((s) => (
                      <Box key={s.id} sx={{ p: 2, border: "1px solid #eee", borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {s.formTitle || "Form"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Elder: {s.elderName || "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Filled at: {s.filledAt || "Unknown"}
                        </Typography>
                        <Box mt={1}>
                          <Button size="small" variant="outlined" href={s.id ? `/Submissions/${s.id}/Responses` : undefined}>
                            View
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default AdminDashboard;