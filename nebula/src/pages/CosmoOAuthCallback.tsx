import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { User } from "./Profile";

interface CosmoOAuthCallbackProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function CosmoOAuthCallback({ setUser }: CosmoOAuthCallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    const pendingToken = searchParams.get("pendingToken");
    const email = searchParams.get("email");
    const discordId = searchParams.get("discordId");

    if (transactionId && pendingToken && email && discordId) {
      // 調用後端的 /api/exchange-token 端點
      axios
        .post("http://localhost:5000/api/exchange-token", {
          transactionId,
          pendingToken,
          email,
        })
        .then((response) => {
          if (response.data.success) {
            const { address, cosmo_id } = response.data;
            setUser((prevUser) => {
                if (!prevUser) return prevUser; // 如果沒有現有用戶，返回 null
                return {
                  ...prevUser,
                  cosmo_id,
                  address,
                };
              });
            navigate(`/profile/${discordId}`);
          } else {
            console.error("Failed to exchange token:", response.data.error);
            navigate("/cosmo-login");
          }
        })
        .catch((error) => {
          console.error("Error exchanging token:", error);
          navigate(`/profile/${discordId}`);
        });
    } else {
      navigate(`/`);
    }
  }, [searchParams, setUser, navigate]);

  return <div>Processing Cosmo login...</div>;
}