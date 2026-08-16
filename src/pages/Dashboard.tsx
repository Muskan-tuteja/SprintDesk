// import { api } from "./services/api";

// function Dashboard() {
//   const testApi = async () => {
//     try {
//       const response = await api.get("/auth/me");
//       console.log("Success:", response.data);
//       alert("API Success ✅");
//     } catch (error) {
//       console.error(error);
//       alert("API Failed ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-100 p-8">
//       <h1 className="text-3xl font-bold">
//         SprintDesk Dashboard
//       </h1>

//       <button
//         onClick={testApi}
//         className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white"
//       >
//         Test API
//       </button>
//     </div>
//   );
// }