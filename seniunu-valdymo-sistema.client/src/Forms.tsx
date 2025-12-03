import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import AppBar from "./AppBars/ElderAppBar";
import Footer from "./Footers/Footer";
import { jwtDecode } from "jwt-decode";
// New: table components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useNavigate } from "react-router-dom";

type FormItem = {
  id?: number | string;
  adminId?: number;
  createDate?: string;
  updatedAt?: string;
  course: number;
  active: boolean;
  [key: string]: any;
};

function Forms() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token, role } = useMemo(() => {
    const t = localStorage.getItem("jwtToken") || "";
    let r: string | undefined;
    if (t) {
      try {
        const decoded: any = jwtDecode(t);
        r = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? decoded["role"];
      } catch {
        // Invalid token
      }
    }
    return { token: t, role: r };
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await axios.get<FormItem[]>("/api/Forms", { headers });
        console.log("Fetched forms:", res.data);
        const data = res.data;
        if (mounted) setForms(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load forms.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Pick and parse a date from a form
  const parseFormDate = (f: FormItem): Date | null => {
    const raw = f.createDate;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  // Build semester maps:
  // Rudens (Sep–Jan): months 9–12 of Y and Jan of Y+1 belong to year Y
  // Pavasario (Feb–Jun): months 2–6 of Y belong to year Y
  const { rudensMap, pavasarioMap, rudensYears, pavasarioYears } = useMemo(() => {
    const rMap: Record<number, FormItem[]> = {};
    const pMap: Record<number, FormItem[]> = {};
    const rYears = new Set<number>();
    const pYears = new Set<number>();

    for (const f of forms) {
      const d = parseFormDate(f);
      if (!d) continue;

      const y = d.getFullYear();
      const m = d.getMonth() + 1;

      if (m >= 9 && m <= 12) {
        (rMap[y] ||= []).push(f);
        rYears.add(y);
      } else if (m === 1) {
        (rMap[y - 1] ||= []).push(f);
        rYears.add(y - 1);
      } else if (m >= 2 && m <= 6) {
        (pMap[y] ||= []).push(f);
        pYears.add(y);
      }
      // months 7–8 are excluded per requirement
    }

    return {
      rudensMap: rMap,
      pavasarioMap: pMap,
      rudensYears: Array.from(rYears).sort((a, b) => b - a),
      pavasarioYears: Array.from(pYears).sort((a, b) => b - a),
    };
  }, [forms]);

  const formatDate = (d?: string) => {
    const parsed = d ? new Date(d) : undefined;
    return parsed && !isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : "-";
  };

  // Render a semester table with year sections inside
  const renderSemesterTable = (
    title: string,
    years: number[],
    map: Record<number, FormItem[]>
  ) => {
    const any = years.some((y) => (map[y]?.length ?? 0) > 0);
    if (!any) return null;

    return (
      <Box mt={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <TableContainer component={Card} sx={{ width: "100%" }}>
          <Table size="small" sx={{ tableLayout: "auto", minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {years.map((y) => {
                const items = map[y] || [];
                if (items.length === 0) return null;
                return (
                  <React.Fragment key={y}>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {y}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {items.map((f, idx) => {
                      const title = `Form #${f.id ?? idx + 1}`;
                      const rawDate = f.createDate ?? f.updatedAt;
                      return (
                        <TableRow key={f.id ?? `${y}-${idx}`} hover>
                          <TableCell>{title}</TableCell>
                          <TableCell>{formatDate(rawDate)}</TableCell>
                          <TableCell>{f.active ? "Yes" : "No"}</TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                if (f.id != null) navigate(`/Form/${f.id}`, { state: { active: f.active } });
                              }}
                            >
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <>
      <AppBar />
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Forms
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            {forms.length === 0 && <Alert severity="info">No forms available.</Alert>}

            {renderSemesterTable("Rudens semestras", rudensYears, rudensMap)}
            {renderSemesterTable("Pavasario semestras", pavasarioYears, pavasarioMap)}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default Forms;
