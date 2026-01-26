import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

interface UserAccount {
  id: string;
  emailAddress: string;
  accountNo: string;
  name?: string;
}

interface LinkedAccount {
  created_at?: string;
  accountNo: string; // the requester
  linkedWith: string; // the target
  nickName: string;
  requestStatus: string; // 'Pending', 'Accepted', 'Rejected'
  requesterName?: string; // name of the requester
}

export default function LinkAccounts() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<LinkedAccount[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<LinkedAccount[]>([]);

  const fetchAndStoreCurrentUser =
    useCallback(async (): Promise<UserAccount | null> => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          console.log("User not logged in.");
          return null;
        }
        const user = session.user;
        if (!user.email) return null;

        // localaccounts
        let { data: accountData } = await supabase
          .from("Localaccounts")
          .select("*")
          .eq("emailAddress", user.email)
          .single();

        if (!accountData) {
          // foreignaccounts
          let { data: foreignData } = await supabase
            .from("Foreignaccounts")
            .select("*")
            .eq("emailAddress", user.email)
            .single();
          accountData = foreignData;
        }

        return accountData;
      } catch (e) {
        console.error(e);
        return null;
      }
    }, []);

  const fetchNameByAccountNo = useCallback(
    async (accountNo: string): Promise<string | null> => {
      try {
        // localaccounts
        const { data: localData, error: localError } = await supabase
          .from("Localaccounts")
          .select("name")
          .eq("accountNo", accountNo)
          .maybeSingle();

        if (!localError && localData?.name) {
          return localData.name;
        }

        // foreignaccounts
        const { data: foreignData, error: foreignError } = await supabase
          .from("Foreignaccounts")
          .select("name")
          .eq("accountNo", accountNo)
          .maybeSingle();

        if (!foreignError && foreignData?.name) {
          return foreignData.name;
        }
      } catch (err) {
        console.error("Error fetching name for account " + accountNo, err);
      }
      return null;
    },
    [],
  );

  const fetchData = useCallback(
    async (user: UserAccount) => {
      if (!user || !user.accountNo) return;

      // Fetch outgoing requests (accounts that I have linked to)
      const { data: outgoing, error: outgoingError } = await supabase
        .from("Linkedaccounts")
        .select("*")
        .eq("accountNo", user.accountNo);

      if (outgoingError) {
        console.error("Error fetching linked accounts:", outgoingError);
      }

      // Separate outgoing into Pending n other stuff
      const pendingOutgoing: LinkedAccount[] = [];
      const otherOutgoing: LinkedAccount[] = [];

      (outgoing || []).forEach((req) => {
        const s = (req.requestStatus || "").trim().toLowerCase();
        if (s === "pending") {
          pendingOutgoing.push(req);
        } else {
          otherOutgoing.push(req);
        }
      });

      setOutgoingRequests(pendingOutgoing);

      // Fetch incoming requests
      const { data: incoming, error: incomingError } = await supabase
        .from("Linkedaccounts")
        .select("*")
        .eq("linkedWith", user.accountNo);

      if (incomingError) {
        console.error("Error fetching incoming requests:", incomingError);
      } else {
        const pendingIncoming: LinkedAccount[] = [];
        const acceptedIncoming: LinkedAccount[] = [];

        // Process incoming requests
        await Promise.all(
          (incoming || []).map(async (req) => {
            const name = await fetchNameByAccountNo(req.accountNo);

            if (req.requestStatus === "Pending") {
              pendingIncoming.push({
                ...req,
                requesterName: name || undefined,
              });
            } else if (req.requestStatus === "Accepted") {
              acceptedIncoming.push({
                ...req,
                nickName: name || req.accountNo,
                linkedWith: req.accountNo,
                requesterName: name || undefined,
              });
            }
          }),
        );

        setIncomingRequests(pendingIncoming);

        // Merge outgoing and incoming requests
        setLinkedAccounts([...otherOutgoing, ...acceptedIncoming]);
      }
    },
    [fetchNameByAccountNo],
  );

  const initialize = useCallback(async () => {
    setLoading(true);
    const user = await fetchAndStoreCurrentUser();
    if (user) {
      setCurrentUser(user);
      await fetchData(user);
    } else {
      Alert.alert("Error", "Could not verify user.");
    }
    setLoading(false);
  }, [fetchAndStoreCurrentUser, fetchData]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRequestAction = async (
    requesterAccountNo: string,
    newStatus: string,
  ) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from("Linkedaccounts")
      .update({ requestStatus: newStatus })
      .eq("accountNo", requesterAccountNo)
      .eq("linkedWith", currentUser.accountNo);

    if (error) {
      console.error(`Error ${newStatus.toLowerCase()}ing request:`, error);
      Alert.alert("Error", `Failed to ${newStatus.toLowerCase()} request.`);
    } else {
      Alert.alert("Success", `Request ${newStatus}!`);
      fetchData(currentUser);
    }
  };

  const handleAcknowledge = async (account: LinkedAccount) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("Linkedaccounts")
      .delete()
      .eq("accountNo", currentUser.accountNo)
      .eq("linkedWith", account.linkedWith)
      .select();

    if (error) {
      console.error("Error deleting rejected request:", error);
      Alert.alert("Error", "Could not remove notification.");
    } else if (!data || data.length === 0) {
      // if no data returned, it means no rows were deleted
      Alert.alert(
        "System",
        "Unable to delete notification. Database permission denied.",
      );
    } else {
      // Success
      fetchData(currentUser);
    }
  };

  const handleUnlink = async (account: LinkedAccount) => {
    if (!currentUser) return;

    const isMyRequest = account.accountNo === currentUser.accountNo;
    const otherPerson = isMyRequest ? account.linkedWith : account.accountNo;

    Alert.alert(
      "Unlink Account",
      "Are you sure you want to remove this linked account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            let error = null;

            if (isMyRequest) {
              // My outgoing request delete
              const res = await supabase
                .from("Linkedaccounts")
                .delete()
                .eq("accountNo", currentUser.accountNo)
                .eq("linkedWith", otherPerson);
              error = res.error;
            } else {
              // Incoming request delete
              const res = await supabase
                .from("Linkedaccounts")
                .delete()
                .eq("accountNo", otherPerson)
                .eq("linkedWith", currentUser.accountNo);
              error = res.error;
            }

            if (error) {
              console.error("Error unlinking:", error);
              Alert.alert("Error", "Failed to unlink account.");
            } else {
              Alert.alert("Success", "Account unlinked.");
              fetchData(currentUser);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Header (for now)*/}
      <Text className="text-2xl font-bold mb-6 text-gray-800">
        Linked Accounts
      </Text>

      {/* Link New Account Button */}
      <TouchableOpacity
        onPress={() => router.push("/linktoaccount")}
        className="bg-white p-4 rounded-xl mb-6 shadow-sm border border-gray-100 flex-row justify-between items-center"
      >
        <View>
          <Text className="text-lg font-bold text-gray-800">
            Link a New Account
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Add a friend or family member&apos;s account.
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3 text-gray-700">
            Sent Requests
          </Text>
          {outgoingRequests.map((request, index) => {
            const key = request.created_at
              ? request.created_at + index
              : `out-${request.accountNo}-${request.linkedWith}`;
            return (
              <View
                key={key}
                className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-base font-medium text-gray-800">
                    {request.nickName}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {request.linkedWith}
                  </Text>
                  <Text className="text-xs text-yellow-600 mt-1 font-semibold">
                    Pending Acceptance
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleUnlink(request)}
                  className="bg-gray-100 px-3 py-2 rounded-lg"
                >
                  <Text className="text-gray-600 font-semibold text-xs">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Linked Accounts */}
      <View className="mb-8">
        <Text className="text-lg font-semibold mb-3 text-gray-700">
          My Linked Accounts
        </Text>
        {linkedAccounts.length === 0 ? (
          <Text className="text-gray-500 italic p-2 bg-white rounded-lg">
            No linked accounts yet.
          </Text>
        ) : (
          linkedAccounts.map((account, index) => {
            const status = (account.requestStatus || "").trim().toLowerCase();
            const isAccepted = status === "accepted";
            const isRejected = status === "rejected";

            // in case it doesn't work
            const key = account.created_at
              ? account.created_at + index
              : `${account.accountNo}-${account.linkedWith}`;

            if (isRejected) {
              return (
                <View
                  key={key}
                  className="bg-red-50 p-4 rounded-lg mb-3 shadow-sm border border-red-100 flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-bold text-red-800">
                      Request Rejected
                    </Text>
                    <Text className="text-sm text-red-600">
                      Request to {account.nickName} ({account.linkedWith}) was
                      rejected.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAcknowledge(account)}
                    className="bg-red-100 border border-red-300 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-red-800 font-semibold text-xs">
                      Acknowledge
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={key}
                disabled={!isAccepted}
                onPress={() => {
                  if (isAccepted) {
                    router.push({
                      pathname: "/twotappay",
                      params: {
                        accountNo: account.linkedWith,
                        nickName: account.nickName,
                      },
                    });
                  }
                }}
                className={`bg-white p-4 rounded-lg mb-3 shadow-sm border-gray-100 flex-row justify-between items-center ${isAccepted ? "active:bg-gray-50" : ""}`}
              >
                <View>
                  <Text className="text-base font-medium text-gray-800">
                    {account.nickName}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {account.linkedWith}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View
                    className={`px-2 py-1 rounded ${getStatusColor(account.requestStatus)}`}
                  >
                    <Text
                      className={`text-xs font-bold ${getStatusColor(account.requestStatus).split(" ")[0]}`}
                    >
                      {account.requestStatus}
                    </Text>
                  </View>
                  {isAccepted && (
                    <TouchableOpacity
                      onPress={() => handleUnlink(account)}
                      className="p-1"
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={24}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Incoming Requests */}
      <View className="mb-8">
        <Text className="text-lg font-semibold mb-3 text-gray-700">
          Incoming Requests
        </Text>
        {incomingRequests.length === 0 ? (
          <Text className="text-gray-500 italic p-2 bg-white rounded-lg">
            No new requests.
          </Text>
        ) : (
          incomingRequests.map((request, index) => {
            const key = request.created_at
              ? request.created_at + index
              : `req-${request.accountNo}-${request.linkedWith}`;
            return (
              <View
                key={key}
                className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-100"
              >
                <View className="mb-3">
                  <Text className="text-base text-gray-800">
                    Request from:{" "}
                    <Text className="font-bold">
                      {request.requesterName || request.accountNo}
                    </Text>
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {request.accountNo}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() =>
                      handleRequestAction(request.accountNo, "Accepted")
                    }
                    className="bg-green-600 px-4 py-2 rounded-md flex-1 items-center"
                  >
                    <Text className="text-white font-semibold">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleRequestAction(request.accountNo, "Rejected")
                    }
                    className="bg-red-500 px-4 py-2 rounded-md flex-1 items-center"
                  >
                    <Text className="text-white font-semibold">Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
