import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const baseUrl = "https://staging-api.kwikpik.io/dispatch";

function useContinuousFetch(fetchFunction, delay, shouldFetch) {
  useEffect(() => {
    let timeoutId;
    axios.defaults.baseURL = baseUrl;
    axios.defaults.headers.common["Content-Type"] = "application/json";

    async function fetchWithDelay() {
      if (shouldFetch) {
        await fetchFunction();
        timeoutId = setTimeout(fetchWithDelay, delay);
      }
    }

    fetchWithDelay();

    return () => clearTimeout(timeoutId);
  }, [fetchFunction, delay, shouldFetch]);
}

function App() {
  const [dispatchRequests, setDispatchRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [result, setResult] = useState(null);
  const [requestId, setRequestId] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    axios.defaults.baseURL = baseUrl;
    axios.defaults.headers.common["Authorization"] =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjZDdhMDZjLWJiYmUtNDVjNi1iOTI5LTQ2YWFlYmY2ZGIyZCIsImVtYWlsIjoiamF2YXByb2RpZ3k1NkBnbWFpbC5jb20iLCJwYXNzd29yZCI6InRoaXNpc2F0ZXN0cGFzc3dvcmQiLCJuYW1lIjoiS2luZ3NsZXkgVmljdG9yIiwiaWF0IjoxNzI5MDE2NjgzLCJleHAiOjE3MzE2MDg2ODN9.4njxbvm_EkJd8ejZuojoUfQ8NIqSbSTA0z9tbqMZmbE";
    axios.defaults.headers.common["Content-Type"] = "application/json";
  }, []);

  const handleRequest = async (requestType) => {
    try {
      setLoading(true);
      let response;
      switch (requestType) {
        case "GET":
          response = await axios.get("/");
          break;
        case "/accept":
          response = await axios.post("/accept", {
            dispatchId: requestId,
          });
          break;
        case "/arrival":
          response = await axios.post("/arrival", {
            dispatchId: requestId,
          });
          break;
        case "/pick":
          response = await axios.post("/pick", {
            dispatchId: requestId,
          });
          break;
        case "/transit":
          response = await axios.post("/transit", {
            dispatchId: requestId,
          });
          break;
        case "/complete":
          response = await axios.post("/complete", {
            dispatchId: requestId,
            securityCode: code,
          });
          break;
        default:
          throw new Error("Invalid request type");
      }
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error?.response?.data?.error || error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      const response = await axios.get("/find/free");
      if (response.data) {
        setDispatchRequests(response.data?.result?.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, []);

  // Use the custom hook for continuous fetching
  useContinuousFetch(fetchRequests, 2000, shouldFetch);

  return (
    <div className="App" style={{ width: "400px", margin: "10px auto" }}>
      <h1>Kwikpik Demo Rider</h1>

      <div>
      <button
          onClick={() => setShouldFetch((p) => !p)}
          style={{...buttonStyle, ...{marginLeft: 0}}}
        >
          {shouldFetch ? "Stop fetching" : "Start fetching"}
        </button>
        <h2>Dispatch Requests Table:</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {dispatchRequests.map((request) => (
              <tr key={request?.id}>
                <td style={tableCellStyle}>{request?.id}</td>
                <td style={tableCellStyle}>
                  <button
                    onClick={() => setRequestId(request?.id)}
                    disabled={loading}
                    style={{
                      padding: "10px",
                      margin: "10px",
                      background: "skyblue",
                      color: "#fff",
                      border: "1px solid skyblue",
                      borderRadius: "4px",
                    }}
                  >
                    Set as request Id
                  </button>
                </td>
              </tr>
            ))}
            {dispatchRequests.length === 0 && (
              <tr>
                <td colSpan={2}>No pending requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h3>Request Id:</h3>
        <pre>{requestId}</pre>
      </div>

      <div>
        <h3>Security code:</h3>
        <pre>{code}</pre>
      </div>

      <hr />

      <input
        type="text"
        placeholder="requestId"
        value={requestId}
        onChange={(e) => setRequestId(e.target.value)}
        style={{ padding: "10px" }}
      />
      <div>
        <button
          onClick={() => handleRequest("/accept")}
          disabled={loading}
          style={{...buttonStyle, ...{marginLeft: 0}}}
        >
          {loading ? "loading" : "Accept"}
        </button>
        <button
          onClick={() => handleRequest("/arrival")}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "loading" : "Arrive pickup"}
        </button>
        <button
          onClick={() => handleRequest("/pick")}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "loading" : "Pick"}
        </button>
        <button
          onClick={() => handleRequest("/transit")}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "loading" : "Transit"}
        </button>
        <div>
          <input
            type="text"
            placeholder="security code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ padding: "10px" }}
          />
          <button
            onClick={() => handleRequest("/complete")}
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "loading" : "Complete"}
          </button>
        </div>
      </div>

      <div>
        <h2>Result:</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default App;

const tableHeaderStyle = {
  backgroundColor: "#f2f2f2",
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

const buttonStyle = {
  padding: "10px",
  margin: "10px",
  background: "skyblue",
  color: "#fff",
  border: "1px solid skyblue",
  borderRadius: "4px",
};
