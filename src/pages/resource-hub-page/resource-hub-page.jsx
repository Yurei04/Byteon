"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Threads from "@/components/Threads";
import { motion } from "framer-motion";
import ResourceHubCard from "@/components/resourceHub/resourceHub-card";

export default function ResourceHubPage() {
  const [resource, setResource] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("resource_hub")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        return;
      }
      setResource(data || []);
    }

    fetchData();
  }, []);

  // Filtering logic
  const filteredData = resource.filter((item) => {
    const title = (item.title || "").toLowerCase();
    const category = (item.category || "").toLowerCase();

    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" || category === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Category Buttons
  const categories = [
    { label: "All", value: "all" },
    { label: "Web Development", value: "web" },
    { label: "Mobile Development", value: "mobile" },
    { label: "AI", value: "ai" },
    { label: "Machine Learning", value: "ml" },
    { label: "Cybersecurity", value: "cyber" },
    { label: "Cloud / DevOps", value: "cloud" },
    { label: "UI / UX", value: "uiux" },
  ];

  return (
    <div className="w-full min-h-screen p-6 flex flex-col items-center justify-center">
      {/* Background Threads */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <Threads amplitude={2} distance={0.7} enableMouseInteraction={false} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.25, delay: 0.1 }}
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-7xl mt-24"
      >
        <div className="text-center mb-4 ">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-300 to-purple-500">
              Resource Hub
            </span>
          </h1>

          <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
            Find your Stack and Learn It.
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col items-center gap-6 mt-4">

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search titles..."
          className="
            px-4 py-3 rounded-xl w-full text-sm 
            bg-purple-900/50 text-fuchsia-100 
            border border-fuchsia-700/40 
            focus:ring-2 focus:ring-fuchsia-400 
            transition-all shadow-[0_0_10px_rgba(255,0,255,0.25)]
          "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filter Pill Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-semibold transition-all
                ${
                  filter === cat.value
                    ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(255,0,255,0.5)] border border-fuchsia-400"
                    : "bg-purple-900/40 text-fuchsia-200 hover:bg-fuchsia-700/40 border border-fuchsia-600/40"
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col justify-center items-center w-full"
      >
        {filteredData.length === 0 ? (
          <div className="w-full flex justify-center items-center mt-12">
            <h1 className="text-fuchsia-200 text-lg">Resource Hub Is Currently Empty...</h1>
          </div>
        ) : (
          <div className="w-[90%] mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {filteredData.map((item) => (
              <div key={item.id} className="flex justify-center">
                <ResourceHubCard item={item} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
